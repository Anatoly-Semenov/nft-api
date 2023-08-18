import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalyticsInfoResponseColumnDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  units: string;

  @ApiProperty()
  @Expose()
  currentValue: string;

  @ApiProperty()
  @Expose()
  deltaValue: string;

  @ApiProperty({ type: 'boolean' })
  @Expose()
  isVisible = true;
}
