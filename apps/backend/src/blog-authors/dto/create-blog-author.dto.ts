import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBlogAuthorDto {
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsUUID()
  avatarId?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
