import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileAchievementGameDto {
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
  players: number;

  @ApiProperty()
  @Expose({ name: 'earned_achievements' })
  earnedAchievements: number;

  @ApiProperty()
  @Expose()
  achievements: number;
}
