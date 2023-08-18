import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalyticsLinkPlayerRequestDto {
  @ApiProperty() @Expose() text: string;
  @ApiProperty() @Expose() gameId: number;
}
