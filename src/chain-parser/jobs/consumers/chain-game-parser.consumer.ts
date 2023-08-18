import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ChainParserService } from '../../chain-parser.service';
import { Logger } from '@nestjs/common';

@Processor('chain-game-parser-queue')
export class ChainGameParserConsumer {
  private readonly logger = new Logger(ChainGameParserConsumer.name);

  constructor(private readonly chainParserSrv: ChainParserService) {}

  @Process('parse-game')
  async parseGameJob(job: Job): Promise<void> {
    const { gameId } = job.data;
    this.logger.log(
      'ChainGameParserProcessor#parseGameJob execute for gameId: ' + gameId,
    );

    await this.chainParserSrv.runParsing(gameId);
  }
}
