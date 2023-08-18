import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME,
  SolanaAccountTransferAggregationRepository,
} from '../repositories/solana-account-transfer-aggregation.repository';
import { SolanaGameIdEnum } from '../enums/solana-game-id.enum';
import { SolanaAccountTransferEnum } from '../enums/solana-account-transfer.enum';
import {
  SOLANA_CHAIN_PARSER_FACADE_SERVICE_NAME,
  SolanaChainParserFacade,
} from '../facades/solana-chain-parser.facade';

@Injectable()
export class SolanaGameAggregationService {
  private readonly logger = new Logger(SolanaGameAggregationService.name);

  constructor(
    @Inject(SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME)
    private readonly solanaAccountTransferAggregationRepository: SolanaAccountTransferAggregationRepository,
    @Inject(SOLANA_CHAIN_PARSER_FACADE_SERVICE_NAME)
    private readonly solanaChainParserFacade: SolanaChainParserFacade,
  ) {}

  getAggregationMethodList(gameId: SolanaGameIdEnum) {
    return [
      this.solanaChainParserFacade.parseTokenPrice.bind(
        this.solanaChainParserFacade,
        gameId,
      ),
      this.updateEntityWithoutPrice.bind(this, gameId),
      this.copyNewEarnTransferList.bind(this, gameId),
      this.copyNewSpendTransferList.bind(this, gameId),
      this.copyNewSpendNftMovement.bind(this, gameId),
      this.copyNewEarnNftMovement.bind(this, gameId),
      this.removeDuplicate.bind(this, gameId),
    ];
  }

  private copyNewSpendTransferList(gameId: SolanaGameIdEnum): Promise<boolean> {
    return this.copyNewTransferList(gameId, SolanaAccountTransferEnum.SPEND);
  }

  private copyNewEarnTransferList(gameId: SolanaGameIdEnum): Promise<boolean> {
    return this.copyNewTransferList(gameId, SolanaAccountTransferEnum.EARN);
  }

  private copyNewSpendNftMovement(gameId: SolanaGameIdEnum): Promise<boolean> {
    return this.copyNewNftMovement(gameId, SolanaAccountTransferEnum.SPEND);
  }

  private copyNewEarnNftMovement(gameId: SolanaGameIdEnum): Promise<boolean> {
    return this.copyNewNftMovement(gameId, SolanaAccountTransferEnum.EARN);
  }

  private async copyNewTransferList(
    gameId: SolanaGameIdEnum,
    state: SolanaAccountTransferEnum,
  ): Promise<boolean> {
    this.logger.log(
      `Trying call "copyNewTransferList" with args gameId=${gameId} and state=${state}`,
    );

    try {
      const lastProcessedId =
        await this.solanaAccountTransferAggregationRepository.getMaxColumnValue(
          'parent_id',
          state,
          gameId,
        );

      await this.solanaAccountTransferAggregationRepository.copyNewTransferList(
        gameId,
        state,
        lastProcessedId,
      );

      this.logger.log(
        `Method "copyNewTransferList" with args gameId=${gameId} and state=${state} was successfully completed.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "copyNewTransferList" with args gameId=${gameId} and state=${state} throw error: ${reason}.`,
      );

      return false;
    }

    return true;
  }

  private async copyNewNftMovement(
    gameId: SolanaGameIdEnum,
    state: SolanaAccountTransferEnum,
  ): Promise<boolean> {
    this.logger.log(
      `Trying call "copyNewNftMovement" with args gameId=${gameId} and state=${state}`,
    );

    try {
      const lastProcessedId =
        await this.solanaAccountTransferAggregationRepository.getMaxColumnValue(
          'nft_parent_id',
          state,
          gameId,
        );

      await this.solanaAccountTransferAggregationRepository.copyNewNftMovement(
        gameId,
        state,
        lastProcessedId,
      );

      this.logger.log(
        `Method "copyNewNftMovement" with args gameId=${gameId} and state=${state} was successfully completed.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "copyNewNftMovement" with args gameId=${gameId} and state=${state} throw error: ${reason}.`,
      );

      return false;
    }

    return true;
  }

  private async removeDuplicate(gameId: SolanaGameIdEnum): Promise<boolean> {
    this.logger.log(`Trying call "removeDuplicate" with args gameId=${gameId}`);

    try {
      await this.solanaAccountTransferAggregationRepository.removeDuplicate(
        gameId,
      );

      this.logger.log(
        `Method "removeDuplicate" with args gameId=${gameId} was successfully completed.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "removeDuplicate" with args gameId=${gameId} throw error: ${reason}.`,
      );

      return false;
    }

    return true;
  }

  private async updateEntityWithoutPrice(
    gameId: SolanaGameIdEnum,
  ): Promise<boolean> {
    this.logger.log(
      `Trying call "updateEntityWithoutPrice" with args gameId=${gameId}`,
    );

    try {
      await this.solanaAccountTransferAggregationRepository.updateEntityWithoutPrice(
        gameId,
      );

      this.logger.log(
        `Method "updateEntityWithoutPrice" with args gameId=${gameId} was successfully completed.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "updateEntityWithoutPrice" with args gameId=${gameId} throw error: ${reason}.`,
      );

      return false;
    }

    return true;
  }
}
