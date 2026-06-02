import { IsString } from 'class-validator';

export class DeleteCatalogueDto {
  @IsString()
  reason!: string;
}
