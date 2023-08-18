import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SERVICE_SOCIAL_TWITTER,
  SocialTwitterService,
} from '../services/twitter.service';
import { ConfigService } from '@nestjs/config';

export const SCHEDULER_SOCIAL_TWITTER = 'SCHEDULER_SOCIAL_TWITTER';

@Injectable()
export class SocialTwitterScheduler {
  private readonly logger = new Logger(SocialTwitterScheduler.name);

  constructor(
    @Inject(SERVICE_SOCIAL_TWITTER)
    private readonly twitterService: SocialTwitterService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async aggregateTwitterSocialStats(): Promise<void> {
    if (!this.configService.get<boolean>('isCronJobsEnabled')) return;

    this.twitterService.aggregateStats().then(
      () => this.logger.log('Aggregating stats.'),
      (err: Error) => {
        this.logger.error(new Error(err.message));

        throw err;
      },
    );
  }
}
