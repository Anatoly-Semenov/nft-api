import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

export const GAME_USERS_STATS_PROCESSOR = 'game-users-stats-processor';
export const PARSE_GAME_USERS_STATS = 'parse-game-users-stats';

@Injectable()
export class GameUsersStatsProducer {
  constructor(
    @InjectQueue(GAME_USERS_STATS_PROCESSOR)
    private readonly gameUsersStatsQueue: Queue,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_2ND_HOUR)
  async parseStats() {
    if (!this.configService.get<boolean>('isCronJobsEnabled')) return;

    await this.gameUsersStatsQueue.add(PARSE_GAME_USERS_STATS, null, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  }
}
