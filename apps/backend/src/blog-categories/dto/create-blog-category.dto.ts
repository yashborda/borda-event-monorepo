import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBlogCategoryDto {
  @IsString()
  @MaxLength(255)
  categoryName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsUUID()
  bannerImageId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  excerpt?: string;

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
  ogImageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitterTitle?: string;

  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @IsOptional()
  @IsUUID()
  twitterImageId?: string;

  @IsOptional()
  @IsIn(['index', 'noindex'])
  robots?: 'index' | 'noindex';

  @IsOptional()
  @IsIn(['index', 'noindex'])
  googlebot?: 'index' | 'noindex';
}
