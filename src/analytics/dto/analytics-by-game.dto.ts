import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalyticsByGameDto {
  @ApiProperty()
  @Expose()
  scholars: number;

  @ApiProperty()
  @Expose()
  matches: number;

  @ApiProperty()
  @Expose()
  winrate: number;

  @ApiProperty()
  @Expose()
  earned: number;

  @ApiProperty()
  @Expose()
  claimed: number;
}
