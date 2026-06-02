import { IsOptional, IsUUID } from 'class-validator';

export class LinkInquiryCustomerDto {
  // A customer id to link, or null to unlink.
  @IsOptional()
  @IsUUID()
  customerId?: string | null;
}
