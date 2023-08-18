import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { SocialChannelDto } from 'src/socials/dto/social-channel.dto';
import { GameRiskLevel } from '../enums/game-risk-level.enum';
import { GameDto } from './game.dto';

export class GameExtendedCommunityDto {
  @ApiProperty()
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  members_count: number;

  @ApiProperty()
  @Expose()
  members_growth: number;

  @ApiProperty()
  @Expose()
  members_growth_percentage: number;

  @ApiProperty()
  @Expose()
  members_online_count: number;
}

export class GameExtendedCommunitiesDto {
  @ApiProperty()
  @Expose()
  @Type(() => GameExtendedCommunityDto)
  twitter: GameExtendedCommunityDto;

  @ApiProperty()
  @Expose()
  @Type(() => GameExtendedCommunityDto)
  discord: GameExtendedCommunityDto;

  @ApiProperty()
  @Expose()
  @Type(() => GameExtendedCommunityDto)
  telegram: GameExtendedCommunityDto;
}

export class GameExtendedDto extends GameDto {
  @ApiProperty()
  @Expose()
  @Transform(({ value }) => Math.round(value * 100))
  monthly_return_token: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => Math.round(value * 100))
  monthly_return_usd: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => Math.round(value * 10) / 10)
  payback_token: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) =>
    value !== null ? Math.round(value * 10) / 10 : value,
  )
  payback_usd: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => Math.round(value))
  apy_usd: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => Math.round(value * 100) / 100)
  min_investment_usd: number;

  // @ApiProperty()
  // @Expose()
  // // @Transform(({ value }) => (value * 100) / 100)
  // token_cost_usd: number;

  // @ApiProperty()
  // @Expose()
  // // @Transform(({ value }) => (value ? value / 100000 / 10 : value))
  // market_cap_usd: number;

  @ApiProperty()
  @Expose()
  earned_last_days: number;

  @ApiProperty()
  @Expose()
  players_count: number;

  @ApiProperty()
  @Expose()
  earnings: number;

  @ApiProperty()
  @Expose()
  spending: number;

  @ApiProperty()
  @Expose()
  earners: number;

  @ApiProperty()
  @Expose()
  avg_roi: number;

  @ApiProperty()
  @Expose()
  percent_in_profit: number;

  @ApiProperty()
  @Expose()
  monthly_players: number;

  @ApiProperty()
  @Expose()
  risk_level: GameRiskLevel;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => GameExtendedCommunitiesDto)
  communities?: GameExtendedCommunitiesDto;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => SocialChannelDto)
  links?: SocialChannelDto;

  constructor(partial?: Partial<GameExtendedDto>) {
    super();

    if (partial) {
      Object.assign(this, partial);
    }
  }
}
