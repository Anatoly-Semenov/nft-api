import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Cache } from 'cache-manager';
import {
  DiscordAggregationJobData,
  SocialCacheKeyList,
  SocialProcessorList,
  SocialQueueList,
} from 'src/types';
import { SocialStatsDto } from '../dto/social-stats.dto';
import {
  SERVICE_SOCIAL_DISCORD,
  SocialDiscordService,
} from '../services/discord.service';

@Processor(SocialProcessorList.DISCORD)
export class SocialDiscordProcessor {
  private readonly logger = new Logger(SocialDiscordProcessor.name);

  constructor(
    @Inject(SERVICE_SOCIAL_DISCORD)
    private readonly discordService: SocialDiscordService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Process(SocialQueueList.AggregateDiscord)
  async handleAggregation(job: Job<DiscordAggregationJobData>): Promise<void> {
    const {
      data: { link, game_id, channel_id, total, current },
    } = job;

    try {
      const isAggregationExists = await this.discordService.isAggregationExists(
        game_id,
        channel_id,
      );

      if (isAggregationExists) {
        this.logger.log(
          `Aggregation is exists for gameId: ${game_id}, channelId: ${channel_id}, link: ${link}`,
        );

        return;
      }

      const { approximate_presence_count, approximate_member_count } =
        await this.discordService.fetchChannelInfo(link);

      const socialStats = new SocialStatsDto({
        game_id,
        channel_id,
        members_count: approximate_member_count,
        members_online_count: approximate_presence_count,
        date: new Date(),
        comments_count: 0,
        likes_count: 0,
        posts_count: 0,
        reposts_count: 0,
      });

      await this.discordService.saveSocialStats(socialStats);
    } catch (error) {
      this.logger.error(error);
    }

    if (total === current + 1) {
      this.logger.log('Aggregation is finished. Processing stopped.');

      await this.cacheManager.set(
        SocialCacheKeyList.DiscordAggregationProcessing,
        false,
      );
    }

    return;
  }
}
