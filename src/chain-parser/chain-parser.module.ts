import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { TokenContract } from './entities/token-contract.entity';
import { GameContract } from './entities/game-contract.entity';
import { ParserProgress } from './entities/parser-progress.entity';
import { AccountTransfer } from './entities/account-transfer.entity';
import { GameWallet } from './entities/game-wallet.entity';
import { GameTransaction } from './entities/game-transaction.entity';
import { ChainParserController } from './chain-parser.controller';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { TokenContractPriceService } from './services/token-contract-price.service';
import { TokenPriceParserConsumer } from './jobs/consumers/token-price-parser.consumer';
import { TokenContractPrice } from './entities/token-contract-price.entity';
import { AccountTransferAggregation } from './entities/account-transfer-aggregation.entity';
import { GamesModule } from '../games/games.module';
import { ChainParserService } from './chain-parser.service';
import { AccountService } from './services/account.service';
import { ChainService } from './services/chain.service';
import { GameTransactionService } from './services/game-transaction.service';
import { ContractService } from './services/contract.service';
import { AccountTransferService } from './services/account-transfer.service';
import { ProgressService } from './services/progress.service';
import { ChainGameParserConsumer } from './jobs/consumers/chain-game-parser.consumer';
import { ConfigModule } from '@nestjs/config';
import {
  PARSING_STAGE_1,
  S1PrepareTransaction,
} from './parsing-stages/s1-prepare-transaction.stage';
import {
  PARSING_STAGE_2_P1,
  S2P1ParseGameTransaction,
} from './parsing-stages/s2-p1-parse-game-transaction.stage';
import {
  PARSING_STAGE_2_P2,
  S2P2ParseGameTransaction,
} from './parsing-stages/s2-p2-parse-game-transaction.stage';
import {
  PARSING_STAGE_3,
  S3ParseNftLog,
} from './parsing-stages/s3-parse-nft-log.stage';
import {
  PARSING_STAGE_4,
  S4ParseCoinLog,
} from './parsing-stages/s4-parse-coin-log.stage';
import {
  PARSING_STAGE_5,
  S5PostContract,
} from './parsing-stages/s5-post-contract.stage';
import {
  PARSING_STAGE_6,
  S6PostSetCreated,
} from './parsing-stages/s6-post-set-created.stage';
import {
  PARSING_STAGE_7,
  S7PostSetFirstTime,
} from './parsing-stages/s7-post-set-first-time.stage';
import {
  PARSING_STAGE_8,
  S8UserTransactionAggregationStage,
} from './parsing-stages/s8-user-transaction-aggregation.stage';
import {
  PARSING_STAGE_9,
  S9CollectUnknownTokenPrices,
} from './parsing-stages/s9-collect-unknown-token-prices.stage';
import { RawTransactionService } from './services/raw-transaction.service';
import { ParserContractController } from './parser-contract.controller';
import { ParserLog } from './entities/parser-log.entity';
import { AccountTransferAggregationService } from './services/account-transfer-aggregation.service';
import { ParserToolsService } from './services/parser-tools.service';
import { ParserAutostart } from './entities/parser-autostart.entity';
import { AutostartService } from './services/autostart.service';
import { AutostartParsingProduces } from './jobs/producers/autostart-parsing.produces';
import { AccountTransferAggregationRepository } from './repositories/account-transfer-aggregation.repository';
import {
  TokenPriceParserProducer,
  TOKEN_PRICE_PROCESSOR,
} from './jobs/producers/token-price-parser.producer';
import { CustomWeb3ClientService } from './services/custom-web3-client.service';
import { GameUsersStats } from './entities/game-users-stats.entity';
import { GameUsersStatsService } from './services/game-users-stats.service';
import {
  GameUsersStatsProducer,
  GAME_USERS_STATS_PROCESSOR,
} from './jobs/producers/game-users-stats-parser.producer';
import { GameUsersStatsConsumer } from './jobs/consumers/game-users-stats-parser.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      TokenContract,
      GameContract,
      GameWallet,
      AccountTransfer,
      ParserProgress,
      GameTransaction,
      TokenContractPrice,
      AccountTransferAggregation,
      ParserLog,
      ParserAutostart,
      AccountTransferAggregationRepository,
      GameUsersStats,
    ]),
    BullModule.registerQueue({
      name: 'chain-game-parser-queue',
      limiter: {
        max: 10,
        duration: 10000,
        bounceBack: false,
      },
    }),
    BullModule.registerQueue({
      name: TOKEN_PRICE_PROCESSOR,
      limiter: {
        max: 100,
        duration: 10000,
        bounceBack: false,
      },
    }),
    BullModule.registerQueue({
      name: GAME_USERS_STATS_PROCESSOR,
      limiter: {
        max: 100,
        duration: 10000,
        bounceBack: false,
      },
    }),
    HttpModule,
    ConfigModule,
    GamesModule,
  ],
  controllers: [ChainParserController, ParserContractController],
  providers: [
    ChainParserService,
    AccountService,
    ChainService,
    GameTransactionService,
    RawTransactionService,
    ContractService,
    AccountTransferService,
    ProgressService,
    TokenContractPriceService,
    AccountTransferAggregationService,
    ChainGameParserConsumer,
    TokenPriceParserConsumer,
    TokenPriceParserProducer,
    ParserToolsService,
    AutostartService,
    AutostartParsingProduces,
    CustomWeb3ClientService,
    GameUsersStatsConsumer,
    GameUsersStatsProducer,
    GameUsersStatsService,
    {
      useClass: S1PrepareTransaction,
      provide: PARSING_STAGE_1,
    },
    {
      useClass: S2P1ParseGameTransaction,
      provide: PARSING_STAGE_2_P1,
    },
    {
      useClass: S2P2ParseGameTransaction,
      provide: PARSING_STAGE_2_P2,
    },
    {
      useClass: S3ParseNftLog,
      provide: PARSING_STAGE_3,
    },
    {
      useClass: S4ParseCoinLog,
      provide: PARSING_STAGE_4,
    },
    {
      useClass: S5PostContract,
      provide: PARSING_STAGE_5,
    },
    {
      useClass: S6PostSetCreated,
      provide: PARSING_STAGE_6,
    },
    {
      useClass: S7PostSetFirstTime,
      provide: PARSING_STAGE_7,
    },
    {
      useClass: S8UserTransactionAggregationStage,
      provide: PARSING_STAGE_8,
    },
    {
      useClass: S9CollectUnknownTokenPrices,
      provide: PARSING_STAGE_9,
    },
  ],
  exports: [
    AccountTransferAggregationService,
    ContractService,
    TokenContractPriceService,
  ],
})
export class ChainParserModule {}
