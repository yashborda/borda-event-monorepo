import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceThemeDto {
  // Name is auto-generated server-side as `<service-slug-first-word>-theme-NN`.

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
