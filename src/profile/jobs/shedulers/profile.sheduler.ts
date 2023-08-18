import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ProfileProcessorList, ProfileQueueList } from 'src/profile/types';

@Injectable()
export class ProfileScheduler {
  private readonly logger = new Logger(ProfileScheduler.name);

  constructor(
    @InjectQueue(ProfileProcessorList.FetchMintedAchievements)
    private readonly profileQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchAllMintedAchievements(): Promise<void> {
    if (!this.configService.get<boolean>('isCronJobsEnabled')) return;

    try {
      await this.profileQueue.add(
        ProfileQueueList.FetchMintedAchievements,
        null,
        {
          removeOnFail: true,
          removeOnComplete: true,
        },
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
