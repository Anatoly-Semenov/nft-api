import { Inject, Injectable } from '@nestjs/common';
import { SolanaStepnParserService } from './solana-stepn-parser.service';
import { SolanaWalkenParserService } from './solana-walken-parser.service';
import { SolanaGameAggregationService } from './solana-game-aggregation.service';
import {
  SOLANA_GAME_PARSER_PROGRESS_REPOSITORY_SERVICE_NAME,
  SolanaGameParserProgressRepository,
} from '../repositories/solana-game-parser-progress.repository';
import { SolanaGameParserProgress } from '../entities/solana-game-parser-progress.entity';
import { SolanaGameIdEnum } from '../enums/solana-game-id.enum';

@Injectable()
export class SolanaGameListParserService {
  constructor(
    private readonly solanaStepnParserService: SolanaStepnParserService,
    private readonly solanaWalkenParserService: SolanaWalkenParserService,
    private readonly solanaGameAggregationService: SolanaGameAggregationService,
    @Inject(SOLANA_GAME_PARSER_PROGRESS_REPOSITORY_SERVICE_NAME)
    private readonly solanaGameParserProgressRepository: SolanaGameParserProgressRepository,
  ) {}

  async execute(): Promise<void> {
    const gameParserProgress =
      await this.solanaGameParserProgressRepository.findGameForParsing();

    if (!gameParserProgress) {
      return;
    }

    if (gameParserProgress.game_id === SolanaGameIdEnum.STEPN) {
      await this.stepnParser(gameParserProgress);
      return;
    }

    if (gameParserProgress.game_id === SolanaGameIdEnum.WALKEN) {
      await this.walkenParser(gameParserProgress);
      return;
    }
  }

  private async stepnParser(gameParserProgress: SolanaGameParserProgress) {
    await this.gameParser(
      gameParserProgress,
      SolanaGameIdEnum.STEPN,
      this.solanaStepnParserService,
    );
  }

  private async walkenParser(gameParserProgress: SolanaGameParserProgress) {
    await this.gameParser(
      gameParserProgress,
      SolanaGameIdEnum.WALKEN,
      this.solanaWalkenParserService,
    );
  }

  private async gameParser(
    gameParserProgress: SolanaGameParserProgress,
    gameId: SolanaGameIdEnum,
    service: SolanaStepnParserService | SolanaWalkenParserService,
  ) {
    const isAllMethodsSuccess = await this.runParsingMethods(
      gameParserProgress,
      service,
    );

    if (!isAllMethodsSuccess) {
      return;
    }

    await service.prepareBeforeAggregation();

    const isAggregated = await this.runAggregationMethods(
      gameParserProgress,
      gameId,
    );

    if (!isAggregated) {
      return;
    }

    gameParserProgress.method_number = 0;
    gameParserProgress.aggregation_method_number = 0;
    gameParserProgress.activity_number++;
    await this.solanaGameParserProgressRepository.save(gameParserProgress);
  }

  private async runAggregationMethods(
    gameParserProgress: SolanaGameParserProgress,
    gameId: SolanaGameIdEnum,
  ): Promise<boolean> {
    for (
      let i = gameParserProgress.aggregation_method_number;
      i <
      this.solanaGameAggregationService.getAggregationMethodList(gameId).length;
      i++
    ) {
      const isSuccess = await this.solanaGameAggregationService
        .getAggregationMethodList(gameId)
        [i]();

      if (isSuccess) {
        gameParserProgress.aggregation_method_number++;
        await this.solanaGameParserProgressRepository.save(gameParserProgress);
      } else {
        return false;
      }
    }

    gameParserProgress.aggregation_method_number++;
    await this.solanaGameParserProgressRepository.save(gameParserProgress);

    return true;
  }

  private async runParsingMethods(
    gameParserProgress: SolanaGameParserProgress,
    service: SolanaStepnParserService | SolanaWalkenParserService,
  ): Promise<boolean> {
    for (
      let i = gameParserProgress.method_number;
      i < service.getParsingMethodList().length;
      i++
    ) {
      const isSuccess = await service.getParsingMethodList()[i]();

      if (isSuccess) {
        gameParserProgress.method_number++;
        await this.solanaGameParserProgressRepository.save(gameParserProgress);
      } else {
        return false;
      }
    }

    gameParserProgress.method_number++;
    await this.solanaGameParserProgressRepository.save(gameParserProgress);

    return true;
  }
}
