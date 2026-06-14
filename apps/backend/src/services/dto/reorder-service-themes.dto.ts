import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderServiceThemesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  themeIds!: string[];
}
