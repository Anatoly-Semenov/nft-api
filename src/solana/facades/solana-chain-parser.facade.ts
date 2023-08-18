import { Inject, Injectable, Logger } from '@nestjs/common';
import { ContractService } from '../../chain-parser/services/contract.service';
import { TokenContractPriceService } from '../../chain-parser/services/token-contract-price.service';
import {
  SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME,
  SolanaAccountTransferAggregationRepository,
} from '../repositories/solana-account-transfer-aggregation.repository';
import { SolanaGameIdEnum } from '../enums/solana-game-id.enum';

export const SOLANA_CHAIN_PARSER_FACADE_SERVICE_NAME =
  'SOLANA_CHAIN_PARSER_FACADE';

@Injectable()
export class SolanaChainParserFacade {
  private readonly logger = new Logger(SolanaChainParserFacade.name);

  constructor(
    private readonly contractSrv: ContractService,
    private readonly tokenContractPriceSrv: TokenContractPriceService,
    @Inject(SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME)
    private readonly solanaAccountTransferAggregationRepository: SolanaAccountTransferAggregationRepository,
  ) {}

  async parseTokenPrice(gameId: SolanaGameIdEnum): Promise<boolean> {
    this.logger.log(`Trying parseTokenPrice for gameId = ${gameId}`);

    this.logger.log(`Trying getTokenWithoutPriceIds for gameId = ${gameId}`);
    const ids =
      await this.solanaAccountTransferAggregationRepository.getTokenWithoutPriceIds(
        gameId,
      );

    this.logger.log(`Trying getTokensByIds for gameId = ${gameId}`);
    const tokens = await this.contractSrv.getTokensByIds(ids);

    for (const token of tokens) {
      this.logger.log(
        `Trying parseTokenPrice for token ${JSON.stringify(token)}`,
      );

      await this.tokenContractPriceSrv.parseTokenPrice(token);
    }

    this.logger.log(`Success parseTokenPrice for gameId = ${gameId}`);
    return true;
  }
}
