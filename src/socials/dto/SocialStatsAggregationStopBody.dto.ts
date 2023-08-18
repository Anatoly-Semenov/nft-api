import { ApiPropertyOptional } from '@nestjs/swagger';
import { SocialServiceList } from '../entities/social-channel.entity';

export class SocialStatsAggregationStopBodyDto {
  @ApiPropertyOptional({
    description: `List of services example: [${Object.values(
      SocialServiceList,
    ).join(',')}]`,
  })
  services?: string;

  constructor(partial?: Partial<SocialStatsAggregationStopBodyDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
