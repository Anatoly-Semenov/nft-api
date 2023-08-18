import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class MarketInfoDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  symbol: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  asset_platform_id: string;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj?.market_data?.current_price?.usd;
  })
  current_price_usd: number;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    return value.obj?.market_data?.fully_diluted_valuation?.usd;
  })
  market_cap_usd: number;
}
