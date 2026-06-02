import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsUUID()
  catalogueId?: string;
}
