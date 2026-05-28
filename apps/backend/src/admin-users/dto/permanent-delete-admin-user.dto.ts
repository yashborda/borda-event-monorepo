import { IsEmail } from 'class-validator';

export class PermanentDeleteAdminUserDto {
  @IsEmail()
  transferToEmail!: string;
}
