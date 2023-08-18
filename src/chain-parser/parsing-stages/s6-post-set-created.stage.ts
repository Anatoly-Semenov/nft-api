import { Injectable, Logger } from '@nestjs/common';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { AccountTransferService } from '../services/account-transfer.service';
import { ProgressService } from '../services/progress.service';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ParsingStageAbstract } from './parsing-stage.abstract';

export const PARSING_STAGE_6 = 'PARSING_STAGE_6';

/**
 * Set created_at date and transaction_contract for AccountTransferLogs by known
 * chain transactions
 */
@Injectable()
export class S6PostSetCreated extends ParsingStageAbstract {
  constructor(
    protected progressSrv: ProgressService,
    private accountTransferSrv: AccountTransferService,
  ) {
    super();

    this.logger = new Logger(S6PostSetCreated.name);
  }

  protected async execute(config: ParserConfigDto) {
    const progress = await this.getProgress(config);

    await this.accountTransferSrv.setCreatedDateAndContract(config.gameId);

    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);
    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_6;
  }

  protected async getProgress(config: ParserConfigDto) {
    const { gameId } = config;
    const isIncremental = false;
    const type = ProgressStage.STAGE_6;

    const dto = new CreateProgressDto({ gameId, type, end: 1, isIncremental });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
