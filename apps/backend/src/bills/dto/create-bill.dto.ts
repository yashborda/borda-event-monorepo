import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { billStatusEnum } from '../../database/schema/event-enums.js';

export class BillItemDto {
  @IsOptional()
  @IsUUID()
  serviceId?: string | null;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  // Line amount (the amount column). total_amount must equal the sum of these.
  @IsInt()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateBillDto {
  @IsUUID()
  customerId!: string;

  // Optional — defaults to "now" server-side when omitted.
  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @IsDateString()
  eventDate!: string;

  @IsOptional()
  @IsString()
  destinationAddr?: string;

  @IsInt()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  advanceAmount?: number;

  @IsOptional()
  @IsIn(billStatusEnum.enumValues)
  status?: (typeof billStatusEnum.enumValues)[number];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items!: BillItemDto[];
}
