import { IsString } from 'class-validator';

export class DeleteBlogAuthorDto {
  @IsString()
  reason!: string;
}
