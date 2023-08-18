import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import {
  GAME_USERS_STATS_PROCESSOR,
  PARSE_GAME_USERS_STATS,
} from '../producers/game-users-stats-parser.producer';
import { GameUsersStatsService } from 'src/chain-parser/services/game-users-stats.service';

@Processor(GAME_USERS_STATS_PROCESSOR)
export class GameUsersStatsConsumer {
  private readonly logger = new Logger(GameUsersStatsConsumer.name);

  constructor(private readonly gameUsersStatsService: GameUsersStatsService) {}

  @Process(PARSE_GAME_USERS_STATS)
  async parseGameUsersStats(): Promise<void> {
    await this.gameUsersStatsService.getGameStats();
  }

  @OnQueueCompleted()
  async onJobCompleted() {
    this.logger.log(`Complete game users stats process`);
  }

  @OnQueueFailed()
  async onJobFailed() {
    this.logger.error(`Failed game users stats process`);
  }
}
