import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SocialStatsExtendedDto } from '../dto/social-stats-extended.dto';
import { SocialStatsDto } from '../dto/social-stats.dto';
import { SocialStats } from '../entities/social-stats.entity';
import { BaseSocialAbstract } from './base-social-abstract.service';
import { GetSocialStatsListPayload } from './twitter.service';

export const SERVICE_SOCIAL_UNKNOWN = 'SERVICE_SOCIAL_UNKNOWN';

@Injectable()
export class SocialUnknownService extends BaseSocialAbstract {
  constructor() {
    super();
  }

  clearAggregationProcessingCache(): Promise<any> {
    return Promise.resolve('Method did not implement.');
  }

  aggregationStop(): Promise<string> {
    return Promise.resolve('Method did not implement.');
  }

  aggregateStats(): Promise<void> {
    return;
  }

  getStats(gameId: number): Promise<SocialStatsExtendedDto> {
    return Promise.resolve(new SocialStatsExtendedDto());
  }

  getStatsList(
    gameId: number,
    payload: GetSocialStatsListPayload,
  ): Promise<SocialStats[]> {
    return Promise.resolve([new SocialStatsDto()]);
  }

  getLink(gameId: number): Promise<string> {
    throw new InternalServerErrorException('Method did not implement.');
  }
}
