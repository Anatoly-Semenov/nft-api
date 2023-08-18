import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class GetRewardsDto {
  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  readonly date?: Date;
}
