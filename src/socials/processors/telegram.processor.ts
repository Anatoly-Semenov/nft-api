import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Cache } from 'cache-manager';
import {
  TelegramAggregationJobData,
  SocialCacheKeyList,
  SocialProcessorList,
  SocialQueueList,
} from 'src/types';
import { SocialStatsDto } from '../dto/social-stats.dto';
import {
  SERVICE_SOCIAL_TELEGRAM,
  SocialTelegramService,
} from '../services/telegram.service';

@Processor(SocialProcessorList.TELEGRAM)
export class SocialTelegramProcessor {
  private readonly logger = new Logger(SocialTelegramProcessor.name);

  constructor(
    @Inject(SERVICE_SOCIAL_TELEGRAM)
    private readonly telegramService: SocialTelegramService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Process(SocialQueueList.AggregateTelegram)
  async handleAggregation(job: Job<TelegramAggregationJobData>): Promise<void> {
    const {
      data: { username, game_id, channel_id, total, current },
    } = job;

    try {
      const isAggregationExists =
        await this.telegramService.isAggregationExists(game_id, channel_id);

      if (isAggregationExists) {
        this.logger.log(
          `Aggregation is exists for gameId: ${game_id}, channelId: ${channel_id}, username: ${username}`,
        );

        return;
      }

      const { fullChat } = await this.telegramService.getChannelInfo(username);

      const socialStats = new SocialStatsDto({
        channel_id,
        game_id,
        members_count:
          'participantsCount' in fullChat && fullChat.participantsCount != null
            ? fullChat.participantsCount
            : 0,
        members_online_count:
          'onlineCount' in fullChat && fullChat.onlineCount != null
            ? fullChat.onlineCount
            : 0,
        date: new Date(),
      });

      await this.telegramService.saveSocialStats(socialStats);
    } catch (error) {
      this.logger.error(error);
    }

    if (total === current + 1) {
      this.logger.log('Aggregation is finished. Processing stopped.');

      await this.cacheManager.set(
        SocialCacheKeyList.TelegramAggregationProcessing,
        false,
      );
    }

    return;
  }
}
