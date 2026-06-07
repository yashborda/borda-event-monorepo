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
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

@Injectable()
export class DriveService {
  private client: drive_v3.Drive | null = null;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly drizzle: DrizzleService,
  ) {}

  /** Lazily build an authenticated Drive client from the service-account key. */
  private drive(): drive_v3.Drive {
    if (this.client) return this.client;
    const keyFile = this.config.get('GOOGLE_DRIVE_KEY_FILE', { infer: true });
    if (!keyFile)
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_KEY_FILE is not configured',
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
}
