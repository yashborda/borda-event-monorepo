import { IsEmail, MaxLength } from 'class-validator';

export class MagicLinkDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
