import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { SOLANA_GAME_LIST_PARSER_QUEUE } from '../solana.job.queue';
import { Queue } from 'bull';
import { PARSE_GAME_LIST_ID } from '../solana.game.list.job.ids';

export const SOLANA_GAME_LIST_PARSER_JOB_PRODUCER_SERVICE_NAME =
  'SOLANA_GAME_LIST_PARSER_JOB_PRODUCER';

@Injectable()
export class SolanaGameListParserJobProducer {
  constructor(
    @InjectQueue(SOLANA_GAME_LIST_PARSER_QUEUE.name)
    private queue: Queue,
  ) {}

  async cleanAllFailed() {
    await this.queue.clean(0, 'failed');
  }

  async addGameListParser() {
    await this.add(PARSE_GAME_LIST_ID);
  }

  private add(jobId) {
    return this.queue.add(
      jobId,
      {},
      SolanaGameListParserJobProducer.getJobOptions(jobId),
    );
  }

  private static getJobOptions(jobId) {
    return { jobId, removeOnComplete: true, removeOnFail: true };
  }
}
