import { Module } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaCopyService } from './solana-copy.service';
import { SolanaGameParserService } from './services/solana-game-parser.service';
import { SolanaStepnParserService } from './services/solana-stepn-parser.service';
import {
  SOLANA_ACCOUNT_REPOSITORY_SERVICE_NAME,
  SolanaAccountRepository,
} from './repositories/solana-account.repository';
import {
  SOLANA_ACCOUNT_TRANSACTION_REPOSITORY_SERVICE_NAME,
  SolanaAccountTransactionRepository,
} from './repositories/solana-account-transaction.repository';
import {
  SOLANA_ASSOCIATED_TOKEN_ACCOUNT_REPOSITORY_SERVICE_NAME,
  SolanaAssociatedTokenAccountRepository,
} from './repositories/solana-associated-token-account.repository';
import {
  SOLANA_NFT_TRANSFER_REPOSITORY_SERVICE_NAME,
  SolanaNftTransferRepository,
} from './repositories/solana-nft-transfer.repository';
import {
  SOLANA_SIGNATURE_REPOSITORY_SERVICE_NAME,
  SolanaSignatureRepository,
} from './repositories/solana-signature.repository';
import {
  SOLANA_TOKEN_CONTRACT_REPOSITORY_SERVICE_NAME,
  SolanaTokenContractRepository,
} from './repositories/solana-token-contract.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolanaAccount } from './entities/solana-account.entity';
import { SolanaAccountTransaction } from './entities/solana-account-transaction.entity';
import { SolanaAssociatedTokenAccount } from './entities/solana-associated-token-account.entity';
import { SolanaNftTransfer } from './entities/solana-nft-transfer.entity';
import { SolanaSignature } from './entities/solana-signature.entity';
import { SolanaTokenContract } from './entities/solana-token-contract.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { SOLANA_GAME_LIST_PARSER_QUEUE } from './jobs/solana.job.queue';
import { SolanaWalkenParserService } from './services/solana-walken-parser.service';
import {
  SOLANA_GAME_LIST_PARSER_JOB_CONSUMER_SERVICE_NAME,
  SolanaGameListParserJobConsumer,
} from './jobs/consumers/solana-game-list-parser.job.consumer';
import {
  SOLANA_GAME_LIST_PARSER_JOB_PRODUCER_SERVICE_NAME,
  SolanaGameListParserJobProducer,
} from './jobs/producers/solana-game-list-parser.job.producer';
import {
  SOLANA_GAME_LIST_PARSER_SCHEDULER_SERVICE_NAME,
  SolanaGameListParserScheduler,
} from './schedulers/solana-game-list-parser.scheduler';
import {
  SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME,
  SolanaAccountTransferAggregationRepository,
} from './repositories/solana-account-transfer-aggregation.repository';
import { SolanaGameAggregationService } from './services/solana-game-aggregation.service';
import { SolanaAccountTransferAggregation } from './entities/solana-account-transfer-aggregation.entity';
import { SolanaGameParserProgress } from './entities/solana-game-parser-progress.entity';
import {
  SOLANA_GAME_PARSER_PROGRESS_REPOSITORY_SERVICE_NAME,
  SolanaGameParserProgressRepository,
} from './repositories/solana-game-parser-progress.repository';
import { ChainParserModule } from '../chain-parser/chain-parser.module';
import {
  SOLANA_CHAIN_PARSER_FACADE_SERVICE_NAME,
  SolanaChainParserFacade,
} from './facades/solana-chain-parser.facade';
import { SolanaGameListParserService } from './services/solana-game-list-parser.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolanaAccount,
      SolanaAccountTransaction,
      SolanaAssociatedTokenAccount,
      SolanaNftTransfer,
      SolanaSignature,
      SolanaTokenContract,
      SolanaAccountTransferAggregation,
      SolanaGameParserProgress,
    ]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue(SOLANA_GAME_LIST_PARSER_QUEUE),
    ChainParserModule,
  ],
  controllers: [SolanaController],
  providers: [
    SolanaCopyService,
    SolanaWalkenParserService,
    SolanaGameParserService,
    SolanaStepnParserService,
    SolanaGameAggregationService,
    SolanaGameListParserService,
    {
      provide: SOLANA_ACCOUNT_REPOSITORY_SERVICE_NAME,
      useClass: SolanaAccountRepository,
    },
    {
      provide: SOLANA_ACCOUNT_TRANSACTION_REPOSITORY_SERVICE_NAME,
      useClass: SolanaAccountTransactionRepository,
    },
    {
      provide: SOLANA_ASSOCIATED_TOKEN_ACCOUNT_REPOSITORY_SERVICE_NAME,
      useClass: SolanaAssociatedTokenAccountRepository,
    },
    {
      provide: SOLANA_NFT_TRANSFER_REPOSITORY_SERVICE_NAME,
      useClass: SolanaNftTransferRepository,
    },
    {
      provide: SOLANA_SIGNATURE_REPOSITORY_SERVICE_NAME,
      useClass: SolanaSignatureRepository,
    },
    {
      provide: SOLANA_TOKEN_CONTRACT_REPOSITORY_SERVICE_NAME,
      useClass: SolanaTokenContractRepository,
    },
    {
      provide: SOLANA_GAME_LIST_PARSER_JOB_CONSUMER_SERVICE_NAME,
      useClass: SolanaGameListParserJobConsumer,
    },
    {
      provide: SOLANA_GAME_LIST_PARSER_JOB_PRODUCER_SERVICE_NAME,
      useClass: SolanaGameListParserJobProducer,
    },
    {
      provide: SOLANA_GAME_LIST_PARSER_SCHEDULER_SERVICE_NAME,
      useClass: SolanaGameListParserScheduler,
    },
    {
      provide: SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME,
      useClass: SolanaAccountTransferAggregationRepository,
    },
    {
      provide: SOLANA_GAME_PARSER_PROGRESS_REPOSITORY_SERVICE_NAME,
      useClass: SolanaGameParserProgressRepository,
    },
    {
      provide: SOLANA_CHAIN_PARSER_FACADE_SERVICE_NAME,
      useClass: SolanaChainParserFacade,
    },
  ],
})
export class SolanaModule {}
