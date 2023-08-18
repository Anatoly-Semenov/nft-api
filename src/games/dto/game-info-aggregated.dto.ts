import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GameInfoAggregatedDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  game_id: number;

  @ApiProperty()
  @Expose()
  monthly_return_token: number;

  @ApiProperty()
  @Expose()
  monthly_return_usd: number;

  @ApiProperty()
  @Expose()
  floor_price: number;

  @ApiProperty()
  @Expose()
  players_count: number;
}
