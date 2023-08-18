import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { AchievementDto } from 'src/achievements/dto/achievement.dto';
import { GameDto } from 'src/games/dto/game.dto';

export class ProfileGameAchievementDto {
  @ApiProperty()
  @Type(() => GameDto)
  game: GameDto;

  @ApiProperty()
  @Type(() => AchievementDto)
  @IsArray()
  achievements: AchievementDto[];

  @ApiProperty()
  total_achievements: number;

  @ApiProperty()
  mint_status: string;

  constructor(partial?: Partial<ProfileGameAchievementDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
