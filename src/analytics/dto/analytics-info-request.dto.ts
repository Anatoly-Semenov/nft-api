import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalyticsInfoRequestDto {
  @ApiProperty() @Expose() gameId: number;

  @ApiProperty() @Expose() days: number;
}
