import { IsString } from 'class-validator';

export class DeleteBlogTagDto {
  @IsString()
  reason!: string;
}
