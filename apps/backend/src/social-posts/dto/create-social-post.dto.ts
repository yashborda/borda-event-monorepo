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

export class CreateSocialPostDto {
  @IsIn(socialPlatformEnum.enumValues)
  platform!: (typeof socialPlatformEnum.enumValues)[number];

  @IsString()
  postUrl!: string;

  @IsOptional()
  @IsUUID()
  thumbnailId?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
