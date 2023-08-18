import { Inject, Injectable, Logger } from '@nestjs/common';
import { IParsingStage } from './parsing-stages/parsing-stage.interface';
import { PARSING_STAGE_1 } from './parsing-stages/s1-prepare-transaction.stage';
import { PARSING_STAGE_2_P1 } from './parsing-stages/s2-p1-parse-game-transaction.stage';
import { PARSING_STAGE_2_P2 } from './parsing-stages/s2-p2-parse-game-transaction.stage';
import { PARSING_STAGE_3 } from './parsing-stages/s3-parse-nft-log.stage';
import { PARSING_STAGE_4 } from './parsing-stages/s4-parse-coin-log.stage';
import { PARSING_STAGE_5 } from './parsing-stages/s5-post-contract.stage';
import { PARSING_STAGE_6 } from './parsing-stages/s6-post-set-created.stage';
import { PARSING_STAGE_7 } from './parsing-stages/s7-post-set-first-time.stage';
import { PARSING_STAGE_8 } from './parsing-stages/s8-user-transaction-aggregation.stage';
import { PARSING_STAGE_9 } from './parsing-stages/s9-collect-unknown-token-prices.stage';
import { ParserConfigDto } from './dto/parser-config.dto';
import { ContractService } from './services/contract.service';
import { GameForParsingDto } from './dto/game-for-parsing.dto';
import { ProgressService } from './services/progress.service';
import { GamesService } from '../games/games.service';
import { JobDto } from './dto/job.dto';
import { ProgressStatus } from './enums/progress-status.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ChainService } from './services/chain.service';
import { AutostartService } from './services/autostart.service';

@Injectable()
export class ChainParserService {
  private readonly logger = new Logger(ChainParserService.name);

  constructor(
    @Inject(PARSING_STAGE_1) private s1PrepareTransaction: IParsingStage,
    @Inject(PARSING_STAGE_2_P1) private s2p1ParseGameTransaction: IParsingStage,
    @Inject(PARSING_STAGE_2_P2) private s2p2ParseGameTransaction: IParsingStage,
    @Inject(PARSING_STAGE_3) private s3ParseNftLog: IParsingStage,
    @Inject(PARSING_STAGE_4) private s4ParseCoinLog: IParsingStage,
    @Inject(PARSING_STAGE_5) private s5PostContract: IParsingStage,
    @Inject(PARSING_STAGE_6) private s6PostSetCreated: IParsingStage,
    @Inject(PARSING_STAGE_7) private s7PostSetFirstTime: IParsingStage,
    @Inject(PARSING_STAGE_8) private s8TransferAggregation: IParsingStage,
    @Inject(PARSING_STAGE_9) private s9CollectUnknownPrices: IParsingStage,
    private gamesSrv: GamesService,
    private chainSrv: ChainService,
    private contractSrv: ContractService,
    private progressSrv: ProgressService,
    private autostartSrv: AutostartService,
    @InjectQueue('chain-game-parser-queue') private queue: Queue,
  ) {}

  async addJobToQueue(gameId: number) {
    const opts = {
      jobId: 'gameId_' + gameId,
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 0,
      backoff: 0,
    };

    const job = await this.queue.getJob(opts.jobId);
    if (job) {
      this.logger.warn(`JobID ${job.id} already running`);
      return;
    }

    this.logger.log('Add parsing job to queue for gameId: ' + gameId);

    await this.queue.add('parse-game', { gameId }, opts);
  }

  async runParsing(gameId: number) {
    this.logger.log(`Run parsing for gameId: ${gameId}`);

    const progress = await this.progressSrv.getLastByGame(gameId);
    if (progress && progress.status === ProgressStatus.ACTIVE) {
      this.logger.warn('Already in progress for gameId: ' + gameId);
      return;
    }

    const config = await this.getConfig(gameId);

    try {
      await this.executeSteps(config);
    } catch (e) {
      this.logger.error(e.stack);

      const progress = await this.progressSrv.getLastByGame(gameId);
      await this.progressSrv.pause(gameId);

      //TODO: workaround for autostart after fail
      progress.status = ProgressStatus.FAILED;
      await this.progressSrv.pureSave(progress);

      await this.progressSrv.failed(progress, e.stack);
    }
  }

  async stop(gameId: number) {
    await this.progressSrv.pause(gameId);
  }

  async removeFromQueue(gameId: number) {
    await this.removeJobFromQueue(gameId);
  }

  /**
   * List entities prepared for parsing
   */
  async getParsingProcessList() {
    const gameIdList = [...(await this.contractSrv.getGamesIdList())];

    const [lastProgressList, games] = await Promise.all([
      Promise.all(
        gameIdList.map((item) => this.progressSrv.getLastByGame(item)),
      ),
      Promise.all(gameIdList.map((item) => this.gamesSrv.findOne(item))),
    ]);

    return gameIdList.map((id) => {
      const game = games.find((item) => item?.id === id);
      const progress = lastProgressList.find((item) => item?.game_id === id);

      return new GameForParsingDto({
        gameId: id,
        gameTitle: game?.title,
        progressStatus: progress?.status || 'N/A',
      });
    });
  }

  async getJobList(gameId: number) {
    const progressList = await this.progressSrv.getListByGame(gameId);

    return progressList.map((item) => {
      const dto = new JobDto();
      dto.progressStatus = item.status;
      dto.progressCurrent = item.current_value;
      dto.progressEnd = item.end_value;
      dto.progressStart = item.start_value;
      dto.progressId = item.id;
      dto.progressType = item.type;
      dto.progressLeftMs = item.time_left_ms;

      return dto;
    });
  }

  private async executeSteps(config: ParserConfigDto) {
    const { gameId } = config;
    await this.progressSrv.wait(gameId);

    // =========================
    // ===== preprocessing =====
    // =========================
    await this.s1PrepareTransaction.run(config);

    // ===================
    // ===== parsing =====
    // ===================
    await this.s2p1ParseGameTransaction.run(config);
    await this.s2p2ParseGameTransaction.run(config);
    await this.s3ParseNftLog.run(config);
    await this.s4ParseCoinLog.run(config);

    // ==========================
    // ===== postprocessing =====
    // ==========================
    await this.s5PostContract.run(config);
    await this.s6PostSetCreated.run(config);
    await this.s7PostSetFirstTime.run(config);

    // ==========================
    // == Assemble aggregation ==
    // ==========================
    await this.s8TransferAggregation.run(config);

    // ==========================
    // == collect token prices ==
    // ==========================
    await this.s9CollectUnknownPrices.run(config);

    // ===========================
    // == Add game to autostart ==
    // ===== only after fully ====
    // ==== completed process ====
    // ===========================
    if (!(await this.progressSrv.isPaused(gameId))) {
      await this.autostartSrv.addToRotation(gameId);
    }
  }

  private async getConfig(gameId: number) {
    const [
      gameContracts,
      knownTokens,
      allTokens,
      coinContracts,
      commonCoinContracts,
      internalGrab,
      gameWallets,
      systemWallets,
    ] = await Promise.all([
      this.contractSrv.getGameContracts(gameId),
      this.contractSrv.getKnownNftList(gameId),
      this.contractSrv.getAllNftList(gameId),
      this.contractSrv.getCoins(gameId),
      this.contractSrv.getCoins(null),
      this.contractSrv.getContractWithInternalTransactions(),
      this.contractSrv.getGameWallets(gameId),
      this.contractSrv.getSystemWallets(gameId),
    ]);

    const dto = new ParserConfigDto();
    dto.gameId = gameId;
    dto.gameContracts = gameContracts;
    dto.gameAddresses = gameContracts.map((item) => item.address);
    dto.internalGrabList = internalGrab;
    dto.internalGrabAddressList = internalGrab.map((item) => item.address);
    dto.wallets = gameWallets;
    dto.walletAddresses = gameWallets.map((item) => item.address);
    dto.knownNfts = new Set(knownTokens);
    dto.knownNftAddresses = new Set(knownTokens.map((item) => item.address));
    dto.nfts = new Set(allTokens);
    dto.nftAddresses = new Set(allTokens.map((item) => item.address));
    dto.coins = new Set(coinContracts);
    dto.coinAddresses = new Set(coinContracts.map((item) => item.address));
    dto.commonCoins = commonCoinContracts;
    dto.commonCoinAddresses = commonCoinContracts.map((item) => item.address);
    dto.systemWallets = systemWallets;
    dto.systemAddressList = systemWallets.map((item) => item.address);

    return dto;
  }

  private async removeJobFromQueue(gameId: number) {
    const jobId = 'gameId_' + gameId;

    const job = await this.queue.getJob(jobId);
    if (job) {
      try {
        await job.releaseLock();
      } catch (e) {
        this.logger.warn(e.stack);
      }
      // await job.finished();
      await job.remove();
    }
  }
}
