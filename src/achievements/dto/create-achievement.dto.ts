import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAchievementDto {
  @ApiProperty()
  @Type(() => String)
  readonly name: string;

  @ApiProperty()
  @Type(() => Number)
  readonly gameId: number;

  @ApiProperty()
  @Type(() => Number)
  readonly scores: number;
}
