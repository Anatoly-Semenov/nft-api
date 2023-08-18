import { ApiProperty } from '@nestjs/swagger';

export class FortniteStatsResponseDto {
  @ApiProperty()
  score: number;

  @ApiProperty()
  scorePerMin: number;

  @ApiProperty()
  scorePerMatch: number;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  top3: number;

  @ApiProperty()
  top5: number;

  @ApiProperty()
  top6: number;

  @ApiProperty()
  top10: number;

  @ApiProperty()
  top12: number;

  @ApiProperty()
  top25: number;

  @ApiProperty()
  kills: number;

  @ApiProperty()
  killsPerMin: number;

  @ApiProperty()
  killsPerMatch: number;

  @ApiProperty()
  deaths: number;

  @ApiProperty()
  kd: number;

  @ApiProperty()
  matches: number;

  @ApiProperty()
  winRate: number;

  @ApiProperty()
  minutesPlayed: number;

  @ApiProperty()
  playersOutlived: number;

  @ApiProperty()
  lastModified: Date;
}
