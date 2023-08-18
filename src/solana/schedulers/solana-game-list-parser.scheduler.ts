import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SOLANA_GAME_LIST_PARSER_JOB_PRODUCER_SERVICE_NAME,
  SolanaGameListParserJobProducer,
} from '../jobs/producers/solana-game-list-parser.job.producer';

export const SOLANA_GAME_LIST_PARSER_SCHEDULER_SERVICE_NAME =
  'SOLANA_GAME_LIST_PARSER_SCHEDULER';

// const EVERY_HOUR_ON_45TH_MINUTE = '0 45 * * * *';

@Injectable()
export class SolanaGameListParserScheduler {
  constructor(
    @Inject(SOLANA_GAME_LIST_PARSER_JOB_PRODUCER_SERVICE_NAME)
    private readonly solanaGameListParserJobProducer: SolanaGameListParserJobProducer,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async parserGameList() {
    if (!this.configService.get<boolean>('isParserSolanaCronJobsEnabled')) {
      return;
    }

    await this.solanaGameListParserJobProducer.addGameListParser();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async clean() {
    if (!this.configService.get<boolean>('isParserSolanaCronJobsEnabled')) {
      return;
    }

    await this.solanaGameListParserJobProducer.cleanAllFailed();
  }
}
