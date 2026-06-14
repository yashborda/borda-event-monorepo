import { IsString, MaxLength, MinLength } from 'class-validator';

export class RenameServiceVideoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;
}
