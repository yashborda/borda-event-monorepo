import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import type { Env } from '../config/config.module.js';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  /** Present with Multer memory storage (images). */
  buffer?: Buffer;
  /** Present with Multer disk storage (videos) — stream from here instead. */
  path?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150 MB
const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/ogg': 'ogv',
};

/**
 * Cloudflare R2 storage service. Replaces the former Google Drive integration.
 *
 * Talks to the R2 bucket over the S3-compatible API. Files are stored under a
 * `<folder>/<uuid>.<ext>` object key and served publicly via the bucket's
 * R2 public URL (R2_PUBLIC_URL).
 *
 * Compatibility note: the media_files / service_videos tables keep their
 * `drive_file_id` / `drive_url` columns. We reuse `driveFileId` to store the R2
 * **object key** (needed for later deletion) and `driveUrl` for the playable
 * URL, so no schema migration was required for the swap.
 */
@Injectable()
export class R2Service {
  private client: S3Client | null = null;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly drizzle: DrizzleService,
  ) {}

  private s3(): S3Client {
    if (this.client) return this.client;

    const accountId = this.config.get('R2_ACCOUNT_ID', { infer: true });
    const accessKeyId = this.config.get('R2_ACCESS_KEY_ID', { infer: true });
    const secretAccessKey = this.config.get('R2_SECRET_ACCESS_KEY', {
      infer: true,
    });

    if (!accountId || !accessKeyId || !secretAccessKey)
      throw new InternalServerErrorException(
        'R2 storage is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)',
      );

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
    return this.client;
  }

  private bucket(): string {
    const bucket = this.config.get('R2_BUCKET', { infer: true });
    if (!bucket)
      throw new InternalServerErrorException('R2_BUCKET is not configured');
    return bucket;
  }

  /** Public base URL the bucket is served from, no trailing slash. */
  private publicUrl(): string {
    const url = this.config.get('R2_PUBLIC_URL', { infer: true });
    if (!url)
      throw new InternalServerErrorException('R2_PUBLIC_URL is not configured');
    return url.replace(/\/+$/, '');
  }

  /**
   * Build a safe object-key prefix from a subfolder name. R2 has no real
   * folders — the prefix is just part of the key. We slugify so service names
   * like "DJ & Orchestra" become "dj-orchestra".
   */
  private folderPrefix(name: string): string {
    const slug = (name || 'general')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'general';
  }

  private objectKey(subfolder: string, mimetype: string): string {
    const ext = EXT_BY_MIME[mimetype] ?? 'bin';
    return `${this.folderPrefix(subfolder)}/${randomUUID()}.${ext}`;
  }

  /** True if an object already exists at this key. */
  private async objectExists(key: string): Promise<boolean> {
    try {
      await this.s3().send(
        new HeadObjectCommand({ Bucket: this.bucket(), Key: key }),
      );
      return true;
    } catch (err: unknown) {
      // 404 / NotFound → free. Anything else is a real error worth surfacing.
      const e = err as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (e?.name === 'NotFound' || e?.$metadata?.httpStatusCode === 404)
        return false;
      throw err;
    }
  }

  /**
   * Allocate a readable, collision-free key of the form
   * `<folder>/<prefix>-NN.<ext>` where NN starts at `startSeq` (zero-padded to
   * 2) and increments past any already-taken keys. Used for theme media so the
   * R2 browser shows names like `baby-shower/th-01-03.jpg` instead of UUIDs.
   */
  private async allocateSequencedKey(
    folder: string,
    prefix: string,
    startSeq: number,
    ext: string,
  ): Promise<string> {
    let seq = Math.max(1, startSeq);
    // Bounded loop — a theme realistically holds far fewer than 1000 files.
    for (let i = 0; i < 1000; i++) {
      const pad = seq < 100 ? String(seq).padStart(2, '0') : String(seq);
      const key = `${folder}/${prefix}-${pad}.${ext}`;
      if (!(await this.objectExists(key))) return key;
      seq++;
    }
    // Fallback: extremely unlikely, keep upload working with a unique suffix.
    return `${folder}/${prefix}-${randomUUID().slice(0, 8)}.${ext}`;
  }

  /**
   * Kept for interface compatibility with the old DriveService — R2 creates no
   * folders, so the "subfolder" is resolved lazily as a key prefix at upload
   * time. Returns the prefix string.
   */
  findOrCreateSubfolder(name: string): Promise<string> {
    return Promise.resolve(this.folderPrefix(name));
  }

  /**
   * Upload an image to R2 under the named subfolder and persist a media_files
   * row. Returns the record.
   *
   * When `opts.namePrefix` is given the object key becomes a readable,
   * collision-free `<folder>/<namePrefix>-NN.<ext>` (NN starting at
   * `opts.startSeq`) instead of a UUID — used for theme media so files read as
   * e.g. `baby-shower/th-01-03.jpg`.
   */
  async uploadImage(
    file: UploadedFile,
    subfolder: string,
    opts?: { namePrefix?: string; startSeq?: number },
  ) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      );
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File size must not exceed 150 MB.');
    if (!file.buffer)
      throw new BadRequestException('File contents are missing.');

    const folderName = this.folderPrefix(subfolder);
    const ext = EXT_BY_MIME[file.mimetype] ?? 'bin';
    const key = opts?.namePrefix
      ? await this.allocateSequencedKey(
          folderName,
          opts.namePrefix,
          opts.startSeq ?? 1,
          ext,
        )
      : this.objectKey(subfolder, file.mimetype);

    await this.s3().send(
      new PutObjectCommand({
        Bucket: this.bucket(),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.publicUrl()}/${key}`;

    const [record] = await this.drizzle.db
      .insert(mediaFiles)
      .values({
        url,
        // Reuse the legacy drive_file_id column to store the R2 object key.
        driveFileId: key,
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
   * Delete the R2 object backing a media_files row, then remove the row.
   * Hard delete — matches the existing convention (media_files has no
   * soft-delete column).
   */
  async deleteFile(mediaFileId: string): Promise<void> {
    const [record] = await this.drizzle.db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId))
      .limit(1);

    if (!record) return;

    // driveFileId holds the R2 object key for R2-stored media.
    if (record.driveFileId) {
      await this.deleteObject(record.driveFileId);
    }

    await this.drizzle.db
      .delete(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId));
  }

  /**
   * Rename a media file's display name by its media_files id. R2 object keys
   * are immutable (see renameFile), so this only updates the DB originalName.
   * Returns the updated { id, originalName }; throws if the id is unknown.
   */
  async renameMediaFile(
    mediaFileId: string,
    newName: string,
  ): Promise<{ id: string; originalName: string }> {
    const trimmed = newName.trim();
    if (!trimmed) throw new BadRequestException('Name cannot be empty');

    const [record] = await this.drizzle.db
      .select({ id: mediaFiles.id })
      .from(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId))
      .limit(1);
    if (!record) throw new NotFoundException('Media file not found');

    await this.drizzle.db
      .update(mediaFiles)
      .set({ originalName: trimmed })
      .where(eq(mediaFiles.id, mediaFileId));

    return { id: mediaFileId, originalName: trimmed };
  }

  /**
   * Upload a video to R2 (streamed from the Multer temp file so a large upload
   * never sits fully in memory) and return its object key + public URL. Unlike
   * uploadImage this does NOT insert a media_files row (service_videos tracks it
   * directly). The returned `driveFileId` is the R2 object key; `driveUrl` is
   * the public playable URL.
   */
  async uploadVideo(
    file: UploadedFile,
    subfolder: string,
    opts?: { namePrefix?: string; startSeq?: number },
  ): Promise<{ driveFileId: string; driveUrl: string }> {
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype))
      throw new BadRequestException(
        'Invalid video type. Only MP4, WebM, MOV, and OGG are allowed.',
      );
    if (file.size > MAX_VIDEO_SIZE)
      throw new BadRequestException('Video size must not exceed 500 MB.');

    const ext = EXT_BY_MIME[file.mimetype] ?? 'bin';
    const key = opts?.namePrefix
      ? await this.allocateSequencedKey(
          this.folderPrefix(subfolder),
          opts.namePrefix,
          opts.startSeq ?? 1,
          ext,
        )
      : this.objectKey(subfolder, file.mimetype);

    try {
      // Stream from the temp file when present (videos use Multer disk storage),
      // otherwise fall back to an in-memory buffer.
      let body: Buffer | ReturnType<typeof createReadStream>;
      let contentLength: number;
      if (file.path) {
        body = createReadStream(file.path);
        contentLength = (await stat(file.path)).size;
      } else if (file.buffer) {
        body = file.buffer;
        contentLength = file.buffer.length;
      } else {
        throw new BadRequestException('Video contents are missing.');
      }

      await this.s3().send(
        new PutObjectCommand({
          Bucket: this.bucket(),
          Key: key,
          Body: body,
          ContentType: file.mimetype,
          // R2/S3 needs a known length for a non-buffered stream body.
          ContentLength: contentLength,
        }),
      );

      const driveUrl = `${this.publicUrl()}/${key}`;
      return { driveFileId: key, driveUrl };
    } finally {
      // Remove the temp file Multer wrote, regardless of success/failure.
      if (file.path) await unlink(file.path).catch(() => undefined);
    }
  }

  /**
   * Rename a file. R2/S3 object keys are immutable and the public URL is keyed
   * by the object key, so a true storage rename would change every stored URL.
   * The old Drive integration only changed the Drive *display name* without
   * touching the URL — there is no equivalent in R2, so this is a no-op on
   * storage. Callers still update the DB display name (originalName / title).
   */
  renameFile(_objectKey: string, newName: string): Promise<void> {
    const trimmed = newName.trim();
    if (!trimmed) throw new BadRequestException('Name cannot be empty');
    return Promise.resolve();
  }

  /**
   * Delete an R2 object directly by its object key (no media_files row).
   * Used for R2-hosted videos. Ignores "already gone" errors.
   */
  async deleteDriveFile(objectKey: string): Promise<void> {
    await this.deleteObject(objectKey);
  }

  private async deleteObject(key: string): Promise<void> {
    try {
      await this.s3().send(
        new DeleteObjectCommand({ Bucket: this.bucket(), Key: key }),
      );
    } catch {
      // Object may already be gone; ignore.
    }
  }
}
