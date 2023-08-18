import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAchievementsDto {
  @ApiPropertyOptional()
  readonly id?: string | string[];

  @ApiPropertyOptional()
  readonly name?: string;

  @ApiPropertyOptional()
  readonly gameId?: number;
}
