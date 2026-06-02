import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AttachCatalogueServiceDto {
  @IsUUID()
  serviceId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
