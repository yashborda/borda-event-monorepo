import { IsOptional, IsUUID } from 'class-validator';

export class TransferBlogsBlogAuthorDto {
  @IsOptional()
  @IsUUID('4')
  transferToAuthorId?: string;
}
