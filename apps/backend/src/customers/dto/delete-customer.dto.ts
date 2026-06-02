import { IsString } from 'class-validator';

export class DeleteCustomerDto {
  @IsString()
  reason!: string;
}
