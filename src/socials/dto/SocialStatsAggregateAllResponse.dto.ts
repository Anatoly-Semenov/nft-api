import { ApiProperty } from '@nestjs/swagger';

export class SocialStatsAggregateAllResponseDto {
  @ApiProperty()
  twitter: string;

  @ApiProperty()
  discord: string;

  @ApiProperty()
  telegram: string;

  constructor(partial?: Partial<SocialStatsAggregateAllResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
