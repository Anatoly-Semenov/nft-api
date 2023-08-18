import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class GameTokenContractDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  market_cap: number;

  @ApiProperty()
  @Expose()
  market_cap_delta: number;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  price_delta: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value.large)
  image: string;

  @ApiProperty()
  @Expose()
  ticker: string;
}
