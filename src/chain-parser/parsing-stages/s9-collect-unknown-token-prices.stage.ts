import { Injectable, Logger } from '@nestjs/common';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ProgressService } from '../services/progress.service';
import { ParsingStageAbstract } from './parsing-stage.abstract';
import { TokenContractPriceService } from '../services/token-contract-price.service';
import { AccountTransferAggregationService } from '../services/account-transfer-aggregation.service';
import { ContractService } from '../services/contract.service';
import { sleep } from 'telegram/Helpers';

export const PARSING_STAGE_9 = 'PARSING_STAGE_9';

@Injectable()
export class S9CollectUnknownTokenPrices extends ParsingStageAbstract {
  constructor(
    protected progressSrv: ProgressService,
    private readonly contractSrv: ContractService,
    private readonly tokenContractPriceSrv: TokenContractPriceService,
    private readonly aggregationSrv: AccountTransferAggregationService,
  ) {
    super();

    this.logger = new Logger(S9CollectUnknownTokenPrices.name);
  }

  protected async execute(config: ParserConfigDto) {
    const progress = await this.getProgress(config);
    const { gameId } = config;

    const ids = await this.aggregationSrv.getTokenWithoutPriceIds(gameId);
    const tokens = await this.contractSrv.getTokensByIds(ids);

    for (const token of tokens) {
      await this.tokenContractPriceSrv.parseTokenPrice(token);

      await this.progressSrv.nextStep(progress, config);
      this.progressSrv.cliDisplay(progress, config);

      await sleep(1500);
    }

    await this.aggregationSrv.updateEntityWithoutPrice(gameId);
    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);

    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_9;
  }

  protected async getProgress(config: ParserConfigDto) {
    const { gameId } = config;
    const isIncremental = false;
    const type = ProgressStage.STAGE_9;

    const ids = await this.aggregationSrv.getTokenWithoutPriceIds(gameId);
    const end = ids.length + 1;

    const dto = new CreateProgressDto({ gameId, type, end, isIncremental });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
