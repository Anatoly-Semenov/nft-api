import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalyticsUnlinkPlayerRequestDto {
  @ApiProperty() @Expose() wallet: string;
  @ApiProperty() @Expose() gameId: number;
}
