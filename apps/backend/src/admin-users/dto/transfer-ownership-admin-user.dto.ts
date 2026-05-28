import { IsEmail } from 'class-validator';

export class TransferOwnershipAdminUserDto {
  @IsEmail()
  transferToEmail!: string;
}
