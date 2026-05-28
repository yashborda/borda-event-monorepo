import { IsString, MinLength } from 'class-validator';

export class DeleteWebsiteUserDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
