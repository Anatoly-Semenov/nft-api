import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SortOrderType } from '../enums/sort-order-type.enum';
import { SortType } from '../enums/sort-type.enum';

export class GetItemsListDto<T = SortType> {
  @ApiPropertyOptional()
  @IsOptional()
  readonly limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly offset?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  readonly sort?: T;

  @ApiPropertyOptional({ enum: SortOrderType })
  @IsOptional()
  @IsEnum(SortOrderType, { each: true })
  readonly sortType?: SortOrderType;
}
