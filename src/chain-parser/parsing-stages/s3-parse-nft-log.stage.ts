import { Injectable, Logger } from '@nestjs/common';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ProgressService } from '../services/progress.service';
import { AccountTransferService } from '../services/account-transfer.service';
import { ChainService } from '../services/chain.service';
import { ParsingStageAbstract } from './parsing-stage.abstract';
import { ParserToolsService } from '../services/parser-tools.service';

export const PARSING_STAGE_3 = 'PARSING_STAGE_3';
const STEP = 5000;

/**
 * Collect transfers to AccountTransactions by transactions
 * founded by game token logs
 */
@Injectable()
export class S3ParseNftLog extends ParsingStageAbstract {
  constructor(
    protected progressSrv: ProgressService,
    private chainSrv: ChainService,
    private toolsSrv: ParserToolsService,
    private accountTransferSrv: AccountTransferService,
  ) {
    super();

    this.logger = new Logger(S3ParseNftLog.name);
  }

  protected async execute(cfg: ParserConfigDto) {
    if (!cfg.knownNfts.size) return;

    const progress = await this.getProgress(cfg);

    this.logger.log('Chain node interaction begin');

    while (this.progressSrv.isActive(progress)) {
      console.time('iteration');

      const from = progress.current_value;
      const to = progress.current_value + progress.step;

      let list = await this.chainSrv.tokensHash(cfg, from, to);
      list = await this.accountTransferSrv.filterKnown(cfg, list, from, to);

      await this.toolsSrv.handleTokenTransaction(list, cfg, progress);

      console.timeEnd('iteration');
    }

    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_3;
  }

  protected async getProgress(config: ParserConfigDto) {
    const type = ProgressStage.STAGE_3;
    const step = Math.round(STEP / config.knownNfts.size);

    return this.toolsSrv.getProgressForTokenSteps(step, type, config);
  }
}
