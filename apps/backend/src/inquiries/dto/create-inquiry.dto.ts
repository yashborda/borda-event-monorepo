import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  // Phone OR email is required — enforced in WebsiteInquiriesService.create,
  // since class-validator can't express "at least one of two" declaratively.
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  service?: string;

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
