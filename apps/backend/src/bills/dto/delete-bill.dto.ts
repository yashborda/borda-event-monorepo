import { IsString } from 'class-validator';

export class DeleteBillDto {
  @IsString()
  reason!: string;
}
