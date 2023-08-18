import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SocialChannelDto } from 'src/socials/dto/social-channel.dto';
import { GameDto } from './game.dto';
import { GamesInfoStatsDto } from './games-info-stats.dto';

export class GamesInfoDetailItemDto extends GameDto {
  @ApiProperty()
  @Expose()
  @Type(() => GamesInfoStatsDto)
  stats: GamesInfoStatsDto;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => SocialChannelDto)
  links?: SocialChannelDto;
}
