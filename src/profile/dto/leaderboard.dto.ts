import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LeaderboardDto {
  @ApiProperty()
  @Type(() => Number)
  user_id: number;

  @ApiProperty()
  @Type(() => Number)
  index: number;

  @ApiProperty()
  @Type(() => String)
  avatar: string;

  @ApiProperty()
  @Type(() => String)
  name: string;

  @ApiProperty()
  @Type(() => String)
  wallet: string;

  @ApiProperty()
  @Type(() => Number)
  earned_achievements: number;

  @ApiProperty()
  @Type(() => Number)
  total_achievements: number;

  @ApiProperty()
  @Type(() => Number)
  games: number;

  @ApiProperty()
  @Type(() => Number)
  points: number;

  @ApiProperty()
  @Type(() => Number)
  balance: number;

  constructor(partial?: Partial<LeaderboardDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
