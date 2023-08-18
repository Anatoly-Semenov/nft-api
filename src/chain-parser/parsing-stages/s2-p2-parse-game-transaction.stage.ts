import { Injectable, Logger } from '@nestjs/common';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ProgressStage } from '../enums/progress-stage.enum';
import { GameTransactionService } from '../services/game-transaction.service';
import { ProgressService } from '../services/progress.service';
import { GameTransaction } from '../entities/game-transaction.entity';
import { ParsingStageAbstract } from './parsing-stage.abstract';
import { ParserToolsService } from '../services/parser-tools.service';

export const PARSING_STAGE_2_P2 = 'PARSING_STAGE_2_P2';

const STEP = 50;

/**
 * Collect transfers to AccountTransactions by known game
 * chain transactions WITH INTERNAL TRANSACTIONS
 */
@Injectable()
export class S2P2ParseGameTransaction extends ParsingStageAbstract {
  constructor(
    private toolsSrv: ParserToolsService,
    protected progressSrv: ProgressService,
    private gameTransactionSrv: GameTransactionService,
  ) {
    super();

    this.logger = new Logger(S2P2ParseGameTransaction.name);
  }

  protected async execute(config: ParserConfigDto) {
    let batch: GameTransaction[];
    const { gameId } = config;

    const progress = await this.getProgress(config);

    do {
      batch = await this.gameTransactionSrv.getByGame(gameId, progress, true);
      if (batch.length) {
        await this.toolsSrv.handleGameTransaction(batch, config, progress);
      }
    } while (batch.length && this.progressSrv.isActive(progress));

    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_2_2;
  }

  protected async getProgress(config: ParserConfigDto) {
    const step = STEP;
    const { gameId } = config;
    const type = ProgressStage.STAGE_2_2;
    const [start, end] = await this.gameTransactionSrv.getLimitsByGame(
      gameId,
      true,
    );

    const dto = new CreateProgressDto({ gameId, type, start, step, end });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
