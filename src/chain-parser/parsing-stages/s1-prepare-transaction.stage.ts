import { Injectable, Logger } from '@nestjs/common';
import { GameTransactionService } from '../services/game-transaction.service';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ProgressService } from '../services/progress.service';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { RawTransactionService } from '../services/raw-transaction.service';
import { ParsingStageAbstract } from './parsing-stage.abstract';

export const PARSING_STAGE_1 = 'PARSING_STAGE_1';

@Injectable()
export class S1PrepareTransaction extends ParsingStageAbstract {
  constructor(
    protected progressSrv: ProgressService,
    private rawTransactionService: RawTransactionService,
    private gameTransactionSrv: GameTransactionService,
  ) {
    super();

    this.logger = new Logger(S1PrepareTransaction.name);
  }

  protected async execute(config: ParserConfigDto) {
    const { gameId } = config;

    const progress = await this.getProgress(config);

    const [knownAddresses, newAddresses] = await this.getAddresses(config);

    await this.processKnown(knownAddresses, gameId);
    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);

    await this.processUnknown(newAddresses, gameId);
    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);

    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_1;
  }

  private async processKnown(addresses: string[], gameId: number) {
    const block = await this.gameTransactionSrv.getLastBlock(gameId);
    const list = await this.gameTransactionSrv.hashListByBlock(gameId, block);

    return await this.gameTransactionSrv.saveByKnownAddresses(
      addresses,
      gameId,
      block,
      list,
    );
  }

  private processUnknown(addresses: string[], gameId: number) {
    return this.gameTransactionSrv.saveByUnknownAddresses(addresses, gameId);
  }

  private async getAddresses(config: ParserConfigDto) {
    const { gameId, gameAddresses } = config;

    const knownList = await this.gameTransactionSrv.getKnownAddresses(gameId);
    const newList = gameAddresses.filter((item) => !knownList.includes(item));

    return [knownList, newList];
  }

  protected async getProgress(config: ParserConfigDto) {
    const { gameId } = config;
    const isIncremental = false;
    const type = ProgressStage.STAGE_1;

    const dto = new CreateProgressDto({ gameId, type, end: 2, isIncremental });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
