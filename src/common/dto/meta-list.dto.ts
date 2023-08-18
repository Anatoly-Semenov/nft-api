import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MetaListDto {
  @ApiProperty()
  @Type(() => Number)
  readonly total_items: number;

  @ApiProperty()
  @Type(() => Number)
  readonly total_pages: number;

  @ApiProperty()
  @Type(() => Number)
  readonly current_page: number;

  constructor(partial?: Partial<MetaListDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
