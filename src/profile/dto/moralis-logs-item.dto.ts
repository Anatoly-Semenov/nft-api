import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MoralisLogsItemDto {
  @ApiProperty()
  @Expose()
  transaction_hash: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  block_timestamp: string;

  @ApiProperty()
  @Expose()
  block_number: string;

  @ApiProperty()
  @Expose()
  block_hash: string;

  @ApiProperty()
  @Expose()
  data: any;

  @ApiProperty()
  @Expose()
  topic0: string;

  @ApiProperty()
  @Expose()
  topic1: string;

  @ApiProperty()
  @Expose()
  topic2: string;

  @ApiProperty()
  @Expose()
  topic3: string;
}
