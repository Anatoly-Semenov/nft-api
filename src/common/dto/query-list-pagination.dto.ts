import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QueryListPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  readonly limit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  readonly page: number;

  constructor(partial?: Partial<QueryListPaginationDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
