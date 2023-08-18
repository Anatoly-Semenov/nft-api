import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ChainParserService } from './chain-parser.service';
import { TokenContractPriceService } from './services/token-contract-price.service';
import { UserRole } from '../users/enums/user-role.emun';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { Role } from '../users/decorators/roles.decorator';
import { ChainParserDuplicationType } from './enums/chain-parser.enum';
import { AccountTransferAggregationService } from './services/account-transfer-aggregation.service';
import { GameUsersStatsService } from './services/game-users-stats.service';

@Controller('chain-parser')
@ApiTags('Chain Parser')
@ApiBearerAuth()
export class ChainParserController {
  constructor(
    private readonly chainParserSrv: ChainParserService,
    private readonly tokenContractPriceService: TokenContractPriceService,
    private readonly accountTransferAggregationService: AccountTransferAggregationService,
    private readonly gameUsersStatsService: GameUsersStatsService,
  ) {}

  @Get('/start/:gameId')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Id from game table for parse specified game',
    type: Number,
  })
  start(@Param('gameId') gameId: string) {
    this.chainParserSrv.addJobToQueue(+gameId);

    return 'start OK';
  }

  @Get('/stop/:gameId')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Id from game table for stop postprocessing',
    type: Number,
  })
  async stop(@Param('gameId') gameId: string) {
    await this.chainParserSrv.stop(+gameId);

    return 'stop OK';
  }

  @Get('/remove/:gameId')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Id from game table for stop postprocessing',
    type: Number,
  })
  async remove(@Param('gameId') gameId: string) {
    await this.chainParserSrv.removeFromQueue(+gameId);

    return 'removeFromQueue OK';
  }

  @Get('/list')
  list() {
    return this.chainParserSrv.getParsingProcessList();
  }

  @Get('/list-job/:gameId')
  listJob(@Param('gameId') gameId: string) {
    return this.chainParserSrv.getJobList(+gameId);
  }

  @Get('/games/:gameId/average-earnings')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getGameAverageEarnings(@Param('gameId') gameId: string) {
    return this.gameUsersStatsService.getGameAverageEarnings(+gameId);
  }

  @Get('/games/:gameId/spending-earnings')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getGameSpendingAndEarnings(@Param('gameId') gameId: string) {
    return this.gameUsersStatsService.getGameSpendingAndEarnings(+gameId);
  }

  @Get('/games/:gameId/spenders-earners')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getGameSpendersAndEarners(@Param('gameId') gameId: string) {
    return this.gameUsersStatsService.getGameSpendersAndEarners(+gameId);
  }

  @Get('/games/:gameId/active-users')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getGameActiveUsers(@Param('gameId') gameId: string) {
    return this.gameUsersStatsService.getActiveUsers(+gameId);
  }

  @Get('/games/:gameId/nft-trades')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getNftTradesByGame(@Param('gameId') gameId: string) {
    return this.gameUsersStatsService.getNftTradesByGame(+gameId);
  }

  @Get('/games/:gameId/nft-burn-mint')
  @ApiParam({
    name: 'gameId',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getNftBurnAndMintByGame(@Param('gameId') gameId: string) {
    return this.gameUsersStatsService.getNftBurnAndMintByGame(+gameId);
  }

  @Post('/games/users-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  parseGamesStats(): Promise<void> {
    return this.gameUsersStatsService.getGameStats();
  }

  @Post('/tokens/prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  runPricesParsing(): Promise<void> {
    return this.tokenContractPriceService.parseAllTokenPrices();
  }

  @Post('/tokens/:id/prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  runPricesParsingByToken(@Param('id') id: string): Promise<void> {
    return this.tokenContractPriceService.parseTokenPricesById(id);
  }

  @Delete('/duplications/:type')
  @ApiParam({
    name: 'type',
    required: true,
    type: String,
    description: `Should be one of [${Object.values(
      ChainParserDuplicationType,
    ).join(',')}]`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  async deleteDuplications(@Param('type') type: ChainParserDuplicationType) {
    switch (type) {
      case ChainParserDuplicationType.UserTransactionAggregation:
        await this.accountTransferAggregationService.removeDuplicates();
        return;

      default:
        throw new BadRequestException(`Type: ${type} is unknown.`);
    }
  }
}
