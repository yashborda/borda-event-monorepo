import { IsIn } from 'class-validator';
import { inquiryStatusEnum } from '../../database/schema/event-enums.js';

export class UpdateInquiryStatusDto {
  @IsIn(inquiryStatusEnum.enumValues)
  status!: (typeof inquiryStatusEnum.enumValues)[number];
}
