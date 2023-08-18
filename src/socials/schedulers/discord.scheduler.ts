import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SERVICE_SOCIAL_DISCORD,
  SocialDiscordService,
} from '../services/discord.service';
import { ConfigService } from '@nestjs/config';

export const SCHEDULER_SOCIAL_DISCORD = 'SCHEDULER_SOCIAL_DISCORD';

@Injectable()
export class SocialDiscordScheduler {
  private readonly logger = new Logger(SocialDiscordScheduler.name);

  constructor(
    @Inject(SERVICE_SOCIAL_DISCORD)
    private readonly discordService: SocialDiscordService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async aggregateTwitterSocialStats(): Promise<void> {
    if (!this.configService.get<boolean>('isCronJobsEnabled')) return;

    this.discordService.aggregateStats().then(
      () => this.logger.log('Aggregating stats.'),
      (err: Error) => {
        this.logger.error(new Error(err.message));

        throw err;
      },
    );
  }
}
