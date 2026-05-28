import { IsString, MinLength } from 'class-validator';

export class DeleteAdminUserDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
