import { Process, Processor } from '@nestjs/bull';
import { SOLANA_GAME_LIST_PARSER_QUEUE } from '../solana.job.queue';
import { PARSE_GAME_LIST_ID } from '../solana.game.list.job.ids';
import { SolanaGameListParserService } from '../../services/solana-game-list-parser.service';

export const SOLANA_GAME_LIST_PARSER_JOB_CONSUMER_SERVICE_NAME =
  'SOLANA_GAME_LIST_PARSER_JOB_CONSUMER';

@Processor(SOLANA_GAME_LIST_PARSER_QUEUE.name)
export class SolanaGameListParserJobConsumer {
  constructor(
    private readonly solanaGameListParserService: SolanaGameListParserService,
  ) {}

  @Process(PARSE_GAME_LIST_ID)
  async gameListParser() {
    await this.solanaGameListParserService.execute();
    return {};
  }
}
