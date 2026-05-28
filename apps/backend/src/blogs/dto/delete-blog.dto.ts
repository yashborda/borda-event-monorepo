import { IsString } from 'class-validator';

export class DeleteBlogDto {
  @IsString()
  reason!: string;
}
