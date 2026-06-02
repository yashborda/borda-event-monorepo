import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ReorderSocialPostsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
