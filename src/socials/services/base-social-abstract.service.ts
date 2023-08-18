import { SocialStatsExtendedDto } from '../dto/social-stats-extended.dto';
import { SocialStats } from '../entities/social-stats.entity';
import { ISocialService } from '../interfaces/social-service.interface';
import { GetSocialStatsListPayload } from './twitter.service';

export abstract class BaseSocialAbstract implements ISocialService {
  abstract clearAggregationProcessingCache(): Promise<any>;

  abstract aggregateStats(): Promise<void>;

  abstract aggregationStop(): Promise<string>;

  abstract getStats(gameId: number): Promise<SocialStatsExtendedDto>;

  abstract getStatsList(
    gameId: number,
    payload: GetSocialStatsListPayload,
  ): Promise<SocialStats[]>;

  abstract getLink(gameId: number): Promise<string>;
}
