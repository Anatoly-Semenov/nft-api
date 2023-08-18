import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GameDto } from 'src/games/dto/game.dto';

export class ProfileGameStatsDto {
  @ApiProperty()
  @Type(() => Number)
  points: number;

  @ApiProperty()
  @Type(() => Number)
  spend: number;

  @ApiProperty()
  @Type(() => Number)
  earn: number;

  @ApiProperty()
  @Type(() => Number)
  roi: number;
}

export class ProfileGameDto {
  @ApiProperty()
  @Type(() => GameDto)
  game: GameDto;

  @ApiProperty()
  @Type(() => ProfileGameStatsDto)
  stats: ProfileGameStatsDto;

  @ApiProperty()
  @Type(() => Boolean)
  isActive: boolean;

  constructor(partial?: Partial<ProfileGameDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
