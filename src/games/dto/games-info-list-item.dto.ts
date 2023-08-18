import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { GamesInfoStatsDto } from './games-info-stats.dto';

export class GamesInfoListItemDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiProperty()
  @Expose()
  @Type(() => GamesInfoStatsDto)
  stats: GamesInfoStatsDto;
}
