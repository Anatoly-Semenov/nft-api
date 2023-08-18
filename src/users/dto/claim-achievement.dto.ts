import { ApiProperty } from '@nestjs/swagger';
import { Achievement } from 'src/achievements/entities/achievement.entity';

export class ClaimAchievementDto {
  @ApiProperty()
  readonly achievement: Achievement;
}
