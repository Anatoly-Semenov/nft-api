import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AnalyticsInfoResponseColumnDto } from './analytics-info-response-column.dto';

export class AnalyticsPlayerDto {
  @ApiProperty({ isArray: true, type: AnalyticsInfoResponseColumnDto })
  @Expose()
  columns: AnalyticsInfoResponseColumnDto[] = [];
}
