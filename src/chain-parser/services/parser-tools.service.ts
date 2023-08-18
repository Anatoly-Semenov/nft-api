import { Injectable } from '@nestjs/common';
import { ChainService } from './chain.service';
import { AccountService } from './account.service';
import { ProgressService } from './progress.service';
import { AccountTransferService } from './account-transfer.service';
import { ProgressStage } from '../enums/progress-stage.enum';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { RawTransactionService } from './raw-transaction.service';
import { GameTransactionService } from './game-transaction.service';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { sleep } from 'telegram/Helpers';
import { ContractService } from './contract.service';

const SIZE = 50;
const COOL_DOWN_MS = 5000;

@Injectable()
export class ParserToolsService {
  constructor(
    private chainSrv: ChainService,
    private accountSrv: AccountService,
    private contractSrv: ContractService,
    protected progressSrv: ProgressService,
    private rawTransactionSrv: RawTransactionService,
    private gameTransactionSrv: GameTransactionService,
    private accountTransferSrv: AccountTransferService,
  ) {}

  public async handleGameTransaction(batch, config, progress) {
    const transfers = await this.chainSrv.getTrxListTransfers(batch);

    if (transfers.length) {
      await this.accountSrv.create(transfers, config);
      await this.contractSrv.create(transfers, config);
      await this.accountTransferSrv.create(transfers, config);
    }

    const { current_value } = progress;
    const maxBatchId = batch[batch.length - 1].id + 1;
    const size = maxBatchId - current_value;

    await this.progressSrv.nextStep(progress, config, size);
    this.progressSrv.cliDisplay(progress, config);
  }

  public async handleTokenTransaction(list, config, progress) {
    const transactions = await this.gameTransactionSrv.getByHashList(
      config.gameId,
      list,
    );

    let count = 0;
    let batch = [];

    do {
      console.time('iteration.internal');

      batch = transactions.slice(count * SIZE, (count + 1) * SIZE);

      try {
        const transfers = await this.chainSrv.getTrxListTransfers(batch);

        if (transfers.length) {
          await this.accountSrv.create(transfers, config);
          await this.contractSrv.create(transfers, config);
          await this.accountTransferSrv.create(transfers, config);
        }

        count++;
      } catch (e) {
        await sleep(COOL_DOWN_MS);
      }

      console.timeEnd('iteration.internal');
    } while (batch.length);

    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);
  }

  public async getProgressForTokenSteps(
    step: number,
    type: ProgressStage,
    config: ParserConfigDto,
  ) {
    const { gameId } = config;
    const [start, end] = await Promise.all([
      this.rawTransactionSrv.getMinByGame(config),
      this.gameTransactionSrv.getMaxByEntireGame(config.gameId),
    ]);

    const dto = new CreateProgressDto({ gameId, type, end, step, start });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
