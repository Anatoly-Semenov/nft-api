import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UserBalanceDto {
  @ApiProperty()
  @IsNumber()
  amount: number;
}
