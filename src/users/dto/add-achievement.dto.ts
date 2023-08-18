import { ApiProperty } from '@nestjs/swagger';

export class AddAchievementDto {
  @ApiProperty()
  readonly achievementId: string;
}
