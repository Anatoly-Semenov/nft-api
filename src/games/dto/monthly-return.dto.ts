import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MonthlyReturnDto {
  @ApiProperty()
  @Expose()
  token: number;

  @ApiProperty()
  @Expose()
  usd: number;
}
