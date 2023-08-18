import { SocialStatsExtendedDto } from '../dto/social-stats-extended.dto';
import { SocialStatsDto } from '../dto/social-stats.dto';
import { GetSocialStatsListPayload } from '../services/twitter.service';

export interface ISocialService {
  clearAggregationProcessingCache(): Promise<any>;

  aggregateStats(): Promise<void>;

  aggregationStop(): Promise<string>;

  getStats(gameId: number): Promise<SocialStatsExtendedDto>;

  getStatsList(
    gameId: number,
    payload: GetSocialStatsListPayload,
  ): Promise<SocialStatsDto[]>;

  getLink(gameId: number): Promise<string>;
}
