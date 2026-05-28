import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsBoolean,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsUUID()
  featuredImageId?: string | null;

  @IsOptional()
  @IsString()
  featuredImageAlt?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // SEO
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsUUID()
  ogImageId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitterTitle?: string;

  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @IsOptional()
  @IsUUID()
  twitterImageId?: string | null;

  @IsOptional()
  @IsIn(['index', 'noindex'])
  robots?: string;

  @IsOptional()
  @IsIn(['index', 'noindex'])
  googlebot?: string;
}
