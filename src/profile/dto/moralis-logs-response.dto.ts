import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MoralisLogsItemDto } from './moralis-logs-item.dto';

export class MoralisLogsResponseDto {
  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  page_size: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  cursor: string | null;

  @ApiProperty()
  @Expose()
  result: MoralisLogsItemDto[];
}
