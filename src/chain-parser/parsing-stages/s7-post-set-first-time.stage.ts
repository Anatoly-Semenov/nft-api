import { Injectable, Logger } from '@nestjs/common';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { ProgressService } from '../services/progress.service';
import { ProgressStage } from '../enums/progress-stage.enum';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { AccountService } from '../services/account.service';
import { ParsingStageAbstract } from './parsing-stage.abstract';

export const PARSING_STAGE_7 = 'PARSING_STAGE_7';

/**
 * Set first_time date for Account list by AccountTransaction
 */
@Injectable()
export class S7PostSetFirstTime extends ParsingStageAbstract {
  constructor(
    private accountSrv: AccountService,
    protected progressSrv: ProgressService,
  ) {
    super();

    this.logger = new Logger(S7PostSetFirstTime.name);
  }

  protected async execute(config: ParserConfigDto) {
    const progress = await this.getProgress(config);

    await this.accountSrv.setFirstTime(config.gameId);

    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);
    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_7;
  }

  protected async getProgress(config: ParserConfigDto) {
    const { gameId } = config;
    const isIncremental = false;
    const type = ProgressStage.STAGE_7;

    const dto = new CreateProgressDto({ gameId, type, end: 1, isIncremental });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
