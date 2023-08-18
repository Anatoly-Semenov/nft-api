import { ApiProperty } from '@nestjs/swagger';
import { SocialServiceList } from '../entities/social-channel.entity';

export class SocialStatsAggregateAllQueryDto {
  @ApiProperty({
    description: `List of services example: [${Object.values(
      SocialServiceList,
    ).join(',')}]`,
  })
  services: string;

  constructor(partial?: Partial<SocialStatsAggregateAllQueryDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
