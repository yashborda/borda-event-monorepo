import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import type { Env } from '../config/config.module.js';

interface UploadedFile {
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

const ALLOWED_FOLDERS = [
  'blogs',
  'blog-categories',
  'profiles',
  'general',
] as const;

type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadService {
  private readonly uploadsDir: string;
  private readonly appUrl: string;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly drizzle: DrizzleService,
  ) {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.appUrl = this.config.get('APP_URL', { infer: true }) as string;
  }

  async deleteFileByUrl(url: string): Promise<void> {
    const [record] = await this.drizzle.db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.url, url))
      .limit(1);

    if (!record) return;

    await this.deleteFile(record.id);
  }

  async deleteFile(mediaFileId: string): Promise<void> {
    const [record] = await this.drizzle.db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId))
      .limit(1);

    if (!record) return;

    // Delete from disk
    const prefix = `${this.appUrl}/uploads/`;
    if (record.url.startsWith(prefix)) {
      const relativePath = record.url.slice(prefix.length);
      // Validate: only allow folder/filename pattern (no ../ traversal)
      const parts = relativePath.split('/');
      if (parts.length === 2 && !parts.some((p) => p.includes('..'))) {
        const filepath = path.join(this.uploadsDir, parts[0], parts[1]);
        try {
          await fs.promises.unlink(filepath);
        } catch {
          // File may already be gone; ignore
        }
      }
    }

    // Delete DB record
    await this.drizzle.db
      .delete(mediaFiles)
      .where(eq(mediaFiles.id, mediaFileId));
  }

  async saveImage(
    file: UploadedFile,
    folder: string = 'general',
  ): Promise<{
    id: string;
    url: string;
    folder: string;
    originalName: string;
    mimeType: string;
    size: number;
  }> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must not exceed 5 MB.');
    }

    const safeFolder: AllowedFolder = ALLOWED_FOLDERS.includes(
      folder as AllowedFolder,
    )
      ? (folder as AllowedFolder)
      : 'general';

    const folderPath = path.join(this.uploadsDir, safeFolder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = this.getExtension(file.mimetype);
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(folderPath, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    const url = `${this.appUrl}/uploads/${safeFolder}/${filename}`;

    const [record] = await this.drizzle.db
      .insert(mediaFiles)
      .values({
        url,
        folder: safeFolder,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })
      .returning();

    return {
      id: record.id,
      url: record.url,
      folder: record.folder,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
    };
  }

  private getExtension(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return map[mimetype] ?? 'jpg';
  }
}
