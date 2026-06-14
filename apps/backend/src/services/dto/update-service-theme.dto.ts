import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateServiceThemeDto {
  // Name is read-only after creation.

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
