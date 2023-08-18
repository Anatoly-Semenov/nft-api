import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Cache } from 'cache-manager';
import {
  TwitterAggregationJobData,
  SocialCacheKeyList,
  SocialProcessorList,
  SocialQueueList,
  TwitterMetricsReturned,
} from 'src/types';
import { SocialStatsDto } from '../dto/social-stats.dto';
import {
  SERVICE_SOCIAL_TWITTER,
  SocialTwitterService,
} from '../services/twitter.service';

@Processor(SocialProcessorList.TWITTER)
export class SocialTwitterProcessor {
  private readonly logger = new Logger(SocialTwitterProcessor.name);

  constructor(
    @Inject(SERVICE_SOCIAL_TWITTER)
    private readonly twitterService: SocialTwitterService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Process({ name: SocialQueueList.AggregateTwitter, concurrency: 10 })
  async handleAggregation(job: Job<TwitterAggregationJobData>): Promise<void> {
    const { list, total, current } = job.data;

    try {
      const channels = list.map(({ username }) => username).join(',');

      const userMetrics = await this.twitterService.fetchUserMetricList(
        channels,
      );

      const twitterUserIds = userMetrics.map(({ id }) => id);

      const tweetMetrics = await Promise.all(
        twitterUserIds.map((i) => this.twitterService.fetchTweetMetrics(i)),
      );

      const successUserMetrics = userMetrics.filter(
        ({ username: u }) =>
          !!list.find(({ username: us }) =>
            u.toLowerCase().includes(us.toLowerCase()),
          ),
      );

      const socialStatsList = successUserMetrics.map(
        ({ username, public_metrics, id }) => {
          const item = list.find(({ username: u }) =>
            u.toLowerCase().includes(username.toLowerCase()),
          );

          const tweet = tweetMetrics.find(
            ({ twitterUserId }) => twitterUserId === id,
          );

          const accumulatedMetrics: TwitterMetricsReturned =
            tweet.meta.result_count === 0
              ? { likes_count: 0, comments_count: 0, reposts_count: 0 }
              : tweet.data.reduce(
                  (acc: TwitterMetricsReturned, { public_metrics }) => ({
                    comments_count:
                      acc.comments_count + public_metrics.reply_count,
                    likes_count: acc.likes_count + public_metrics.like_count,
                    reposts_count:
                      acc.reposts_count + public_metrics.retweet_count,
                  }),
                  { likes_count: 0, comments_count: 0, reposts_count: 0 },
                );

          const socialStats = new SocialStatsDto({
            game_id: item.game_id,
            channel_id: item.channel_id,
            members_count: public_metrics.followers_count,
            posts_count: public_metrics.tweet_count,
            comments_count: accumulatedMetrics.comments_count,
            likes_count: accumulatedMetrics.likes_count,
            reposts_count: accumulatedMetrics.reposts_count,
          });

          return socialStats;
        },
      );

      await this.twitterService.saveSocialStats(socialStatsList);
    } catch (error) {
      this.logger.error(
        `Game ${list[0].game_id}: ${error.message}}`,
        error.stack,
      );
    }

    if (total === current + 1) {
      this.logger.log('Aggregation is finished. Processing stopped.');

      await this.cacheManager.set(
        SocialCacheKeyList.TwitterAggregationProcessing,
        false,
      );
    }

    return;
  }
}
