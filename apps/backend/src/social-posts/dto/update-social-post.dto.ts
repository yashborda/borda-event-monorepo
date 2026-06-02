import {
  IsBoolean,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { socialPlatformEnum } from '../../database/schema/event-enums.js';

export class UpdateSocialPostDto {
  @IsOptional()
  @IsIn(socialPlatformEnum.enumValues)
  platform?: (typeof socialPlatformEnum.enumValues)[number];

  @IsOptional()
  @IsString()
  postUrl?: string;

  @IsOptional()
  @IsUUID()
  thumbnailId?: string | null;

  @IsOptional()
  @IsString()
  caption?: string | null;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
