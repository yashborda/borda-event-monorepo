import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ReorderCatalogueServicesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  serviceIds!: string[];
}
