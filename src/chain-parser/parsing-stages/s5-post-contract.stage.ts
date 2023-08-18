import { Injectable, Logger } from '@nestjs/common';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { AccountTransferService } from '../services/account-transfer.service';
import { ProgressService } from '../services/progress.service';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ContractService } from '../services/contract.service';
import { ParsingStageAbstract } from './parsing-stage.abstract';

export const PARSING_STAGE_5 = 'PARSING_STAGE_5';

@Injectable()
export class S5PostContract extends ParsingStageAbstract {
  constructor(
    private contractSrv: ContractService,
    protected progressSrv: ProgressService,
    private accountTransferSrv: AccountTransferService,
  ) {
    super();

    this.logger = new Logger(S5PostContract.name);
  }

  protected async execute(config: ParserConfigDto) {
    await this.contractSrv.contractsToLower();

    const tokens = await this.contractSrv.getDoubledTokens();
    const progress = await this.getProgress(config);

    while (this.progressSrv.isActive(progress)) {
      const mainToken = tokens[progress.current_value];
      const anotherTokens = await this.contractSrv.getSameTokens(
        mainToken.id,
        mainToken.address,
      );

      await Promise.all(
        anotherTokens.map((item) =>
          this.accountTransferSrv.changeTokenContractId(item.id, mainToken.id),
        ),
      );

      await this.contractSrv.deleteToken(anotherTokens);

      await this.progressSrv.nextStep(progress, config);
      this.progressSrv.cliDisplay(progress, config);
    }

    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_5;
  }

  protected async getProgress(config: ParserConfigDto) {
    const { gameId } = config;
    const isIncremental = false;
    const type = ProgressStage.STAGE_5;
    const tokens = await this.contractSrv.getDoubledTokens();
    const end = tokens.length;

    const dto = new CreateProgressDto({ gameId, end, type, isIncremental });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
