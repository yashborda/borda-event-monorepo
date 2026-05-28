import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, {
    message:
      'slug must be lowercase alphanumeric with hyphens or underscores (e.g. my-role or my_role)',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
