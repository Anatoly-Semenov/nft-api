import { Injectable, Logger } from '@nestjs/common';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { AccountTransferService } from '../services/account-transfer.service';
import { ProgressService } from '../services/progress.service';
import { ChainService } from '../services/chain.service';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ParsingStageAbstract } from './parsing-stage.abstract';
import { ParserToolsService } from '../services/parser-tools.service';

export const PARSING_STAGE_4 = 'PARSING_STAGE_4';
const STEP = 5000;

/**
 * Collect transfers to AccountTransactions by transactions
 * founded by game token logs sent from game wallets
 */
@Injectable()
export class S4ParseCoinLog extends ParsingStageAbstract {
  constructor(
    protected progressSrv: ProgressService,
    private chainSrv: ChainService,
    private toolsSrv: ParserToolsService,
    private accountTransferSrv: AccountTransferService,
  ) {
    super();

    this.logger = new Logger(S4ParseCoinLog.name);
  }

  protected async execute(cfg: ParserConfigDto) {
    if (!cfg.wallets.length) return;

    const progress = await this.getProgress(cfg);

    this.logger.log('Chain node interaction begin');

    while (this.progressSrv.isActive(progress)) {
      console.time('iteration');

      const from = progress.current_value;
      const to = progress.current_value + progress.step;

      let list = await this.chainSrv.walletsHash(cfg, from, to);
      list = await this.accountTransferSrv.filterKnown(cfg, list, from, to);

      await this.toolsSrv.handleTokenTransaction(list, cfg, progress);

      console.timeEnd('iteration');
    }

    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_4;
  }

  protected async getProgress(config: ParserConfigDto) {
    const type = ProgressStage.STAGE_4;
    const step = Math.round(STEP / config.wallets.length);

    return this.toolsSrv.getProgressForTokenSteps(step, type, config);
  }
}
