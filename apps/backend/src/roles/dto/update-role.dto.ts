import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @ValidateIf((o: UpdateRoleDto) => o.slug !== null)
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, {
    message:
      'slug must be lowercase alphanumeric with hyphens or underscores (e.g. my-role or my_role)',
  })
  slug?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
