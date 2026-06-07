import { IsIn, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { serviceVideoTypeEnum } from '../../database/schema/event-enums.js';

export class CreateServiceVideoDto {
  @IsIn(serviceVideoTypeEnum.enumValues)
  type!: (typeof serviceVideoTypeEnum.enumValues)[number];

  // Required when type = 'instagram' (the embed / permalink URL).
  // Ignored for 'drive' (drive_url is derived server-side from the upload).
  @ValidateIf((o) => o.type === 'instagram')
  @IsString()
  instagramUrl?: string;

  // Optional cover image (an existing media_files id) — applies to either type.
  @IsOptional()
  @IsUUID()
  thumbnailId?: string;
}
