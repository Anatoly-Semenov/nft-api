import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { QueryListPaginationDto } from './query-list-pagination.dto';

export class QueryListDto<
  Sort = object,
  Filter = object,
> extends QueryListPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  readonly filter: Filter;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  readonly sort: Sort;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  readonly q: string;

  constructor(partial?: Partial<QueryListDto<Sort, Filter>>) {
    super();

    if (partial) {
      Object.assign(this, partial);
    }
  }
}
