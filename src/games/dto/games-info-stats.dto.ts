import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { GameRiskLevel } from '../enums/game-risk-level.enum';
import { GameExtendedCommunityDto } from './game-extended.dto';

export class GamesInfoStatsDto {
  @ApiProperty()
  @Expose()
  new_users: number;

  @ApiProperty()
  @Expose()
  profit: number;

  @ApiProperty()
  @Expose()
  avg_roi: number;

  @ApiProperty()
  @Expose()
  risk_level: GameRiskLevel;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => GameExtendedCommunityDto)
  twitter?: GameExtendedCommunityDto;

  @ApiPropertyOptional()
  @Expose()
  players_count?: number;
}
