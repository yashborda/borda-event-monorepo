import { IsString } from 'class-validator';

export class DeleteBlogCategoryDto {
  @IsString()
  reason!: string;
}
