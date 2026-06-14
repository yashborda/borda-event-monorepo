import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'node:stream';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import type { Env } from '../config/config.module.js';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

@Injectable()
export class DriveService {
  private client: drive_v3.Drive | null = null;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly drizzle: DrizzleService,
  ) {}

  /**
   * Lazily build an authenticated Drive client. Prefers OAuth-as-user flow
   * (uploads land in the human owner's personal Drive, counted against their
   * quota). Falls back to the service-account key file if OAuth isn't
   * configured — but note: service accounts have NO storage quota on personal
   * (non-Workspace) Drives, so service-account auth only works against a
   * Shared Drive root.
   */
  private drive(): drive_v3.Drive {
    if (this.client) return this.client;

    const oauthClientId = this.config.get('GOOGLE_OAUTH_CLIENT_ID', {
      infer: true,
    });
    const oauthClientSecret = this.config.get('GOOGLE_OAUTH_CLIENT_SECRET', {
      infer: true,
    });
    const oauthRefreshToken = this.config.get('GOOGLE_OAUTH_REFRESH_TOKEN', {
      infer: true,
    });

    if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
      // OAuth2Client auto-refreshes access tokens before each API call using
      // the long-lived refresh token. No extra plumbing needed.
      const oauth2 = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
      oauth2.setCredentials({ refresh_token: oauthRefreshToken });
      this.client = google.drive({ version: 'v3', auth: oauth2 });
      return this.client;
    }

    const keyFile = this.config.get('GOOGLE_DRIVE_KEY_FILE', { infer: true });
    if (!keyFile)
      throw new InternalServerErrorException(
        'Neither GOOGLE_OAUTH_* nor GOOGLE_DRIVE_KEY_FILE is configured',
      );
    const auth = new google.auth.GoogleAuth({ keyFile, scopes: DRIVE_SCOPES });
    this.client = google.drive({ version: 'v3', auth });
    return this.client;
  }

  private rootFolderId(): string {
    const id = this.config.get('GOOGLE_DRIVE_ROOT_FOLDER_ID', { infer: true });
    if (!id)
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured',
      );
    return id;
  }

  /**
   * Find a subfolder by name directly under the root folder, or create it.
   * Returns the Drive folder id.
   */
  async findOrCreateSubfolder(name: string): Promise<string> {
    const drive = this.drive();
    const root = this.rootFolderId();
    const folderName = name.trim() || 'general';
    const escaped = folderName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    const found = await drive.files.list({
      q: `mimeType='${FOLDER_MIME}' and name='${escaped}' and '${root}' in parents and trashed=false`,
      fields: 'files(id)',
      pageSize: 1,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const existing = found.data.files?.[0]?.id;
    if (existing) return existing;

    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: FOLDER_MIME,
        parents: [root],
      },
      fields: 'id',
      supportsAllDrives: true,
    });
    if (!created.data.id)
      throw new InternalServerErrorException(
        'Failed to create Drive subfolder',
      );
    return created.data.id;
  }

  /**
   * Upload an image into the named subfolder (created under the root if missing),
   * make it publicly readable, and persist a media_files row. Returns the record.
   */
  async uploadImage(file: UploadedFile, subfolder: string) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      );
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File size must not exceed 5 MB.');

    const folderName = subfolder.trim() || 'general';
    const drive = this.drive();
    const folderId = await this.findOrCreateSubfolder(folderName);

    // Multipart upload: metadata + media bytes in a single request.
    const uploaded = await drive.files.create({
      requestBody: { name: file.originalname, parents: [folderId] },
      media: { mimeType: file.mimetype, body: Readable.from(file.buffer) },
      fields: 'id',
      supportsAllDrives: true,
    });
    const driveFileId = uploaded.data.id;
    if (!driveFileId)
      throw new InternalServerErrorException('Drive upload failed');

    // Make publicly readable.
    await drive.permissions.create({
      fileId: driveFileId,
      requestBody: { type: 'anyone', role: 'reader' },
      supportsAllDrives: true,
    });

    // lh3.googleusercontent.com/d/<id> works well as a direct <img> src.
    const url = `https://lh3.googleusercontent.com/d/${driveFileId}`;

    const [record] = await this.drizzle.db
      .insert(mediaFiles)
      .values({
        url,
        driveFileId,
        folder: folderName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })
      .returning();

    return {
      id: record.id,
      url: record.url,
      driveFileId: record.driveFileId,
      folder: record.folder,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
    };
  }

  /**
   * Delete the Drive file backing a media_files row, then remove the row.
   * media_files has no soft-delete column, so this is a hard delete — matching
   * the existing UploadService.deleteFile convention.
   */
  async deleteFile(mediaFileId: string): Promise<void> {
    const [record] = await this.drizzle.db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId))
      .limit(1);

    if (!record) return;

    if (record.driveFileId) {
      try {
        await this.drive().files.delete({
          fileId: record.driveFileId,
          supportsAllDrives: true,
        });
      } catch {
        // File may already be gone on Drive; ignore and still drop the row.
      }
    }

    await this.drizzle.db
      .delete(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId));
  }

  /**
   * Upload a video into the named subfolder, make it publicly readable, and
   * return its Drive id + an embeddable playable URL. Unlike uploadImage this
   * does NOT insert a media_files row (service_videos tracks it directly).
   */
  async uploadVideo(
    file: UploadedFile,
    subfolder: string,
  ): Promise<{ driveFileId: string; driveUrl: string }> {
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype))
      throw new BadRequestException(
        'Invalid video type. Only MP4, WebM, MOV, and OGG are allowed.',
      );
    if (file.size > MAX_VIDEO_SIZE)
      throw new BadRequestException('Video size must not exceed 500 MB.');

    const folderName = subfolder.trim() || 'general';
    const drive = this.drive();
    const folderId = await this.findOrCreateSubfolder(folderName);

    const uploaded = await drive.files.create({
      requestBody: { name: file.originalname, parents: [folderId] },
      media: { mimeType: file.mimetype, body: Readable.from(file.buffer) },
      fields: 'id',
      supportsAllDrives: true,
    });
    const driveFileId = uploaded.data.id;
    if (!driveFileId)
      throw new InternalServerErrorException('Drive upload failed');

    await drive.permissions.create({
      fileId: driveFileId,
      requestBody: { type: 'anyone', role: 'reader' },
      supportsAllDrives: true,
    });

    const driveUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
    return { driveFileId, driveUrl };
  }

  /**
   * Rename a Drive file in place. The Drive ID stays the same so all stored
   * URLs (lh3.googleusercontent.com/d/<id>, drive.google.com/file/d/<id>/preview)
   * keep working — only the display name in Drive changes. Throws on auth /
   * permission errors so the caller can fail the API request loudly.
   */
  async renameFile(driveFileId: string, newName: string): Promise<void> {
    const trimmed = newName.trim();
    if (!trimmed)
      throw new BadRequestException('Name cannot be empty');
    await this.drive().files.update({
      fileId: driveFileId,
      requestBody: { name: trimmed },
      supportsAllDrives: true,
    });
  }

  /**
   * Delete a Drive file directly by its Drive file id (no media_files row).
   * Used for drive-hosted videos. Ignores "already gone" errors.
   */
  async deleteDriveFile(driveFileId: string): Promise<void> {
    try {
      await this.drive().files.delete({
        fileId: driveFileId,
        supportsAllDrives: true,
      });
    } catch {
      // File may already be gone on Drive; ignore.
    }
  }
}
