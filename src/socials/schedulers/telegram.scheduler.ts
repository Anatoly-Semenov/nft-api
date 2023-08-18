import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SERVICE_SOCIAL_TELEGRAM,
  SocialTelegramService,
} from '../services/telegram.service';
import { ConfigService } from '@nestjs/config';

export const SCHEDULER_SOCIAL_TELEGRAM = 'SCHEDULER_SOCIAL_TELEGRAM';

@Injectable()
export class SocialTelegramScheduler {
  private readonly logger = new Logger(SocialTelegramScheduler.name);

  constructor(
    @Inject(SERVICE_SOCIAL_TELEGRAM)
    private readonly telegramService: SocialTelegramService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async aggregateTwitterSocialStats(): Promise<void> {
    if (!this.configService.get<boolean>('isCronJobsEnabled')) return;

    this.telegramService.aggregateStats().then(
      () => this.logger.log('Aggregating stats.'),
      (err: Error) => {
        this.logger.error(new Error(err.message));

        throw err;
      },
    );
  }
}
