import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AchievementProcessingDto {
  @ApiProperty()
  @Type(() => Number)
  userId: number;
}
