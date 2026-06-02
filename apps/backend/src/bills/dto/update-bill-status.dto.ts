import { IsIn } from 'class-validator';
import { billStatusEnum } from '../../database/schema/event-enums.js';

export class UpdateBillStatusDto {
  @IsIn(billStatusEnum.enumValues)
  status!: (typeof billStatusEnum.enumValues)[number];
}
