import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import {
  AuthAnalyticsGuard,
  TOKEN_HEADER_NAME,
} from './auth-analytics-guard.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsInfoRequestDto } from './dto/analytics-info-request.dto';
import { AnalyticsInfoResponseColumnDto } from './dto/analytics-info-response-column.dto';
import { AnalyticsPlayerDto } from './dto/analytics-player.dto';
import { AnalyticsLinkPlayerRequestDto } from './dto/analytics-link-player-request.dto';
import { AnalyticsPlayersService } from './analytics-players.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { AnalyticsUnlinkPlayerRequestDto } from './dto/analytics-unlink-player-request.dto';

@Controller('analytics')
@ApiTags('Analytics')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsPlayersService: AnalyticsPlayersService,
  ) {}

  @Post('/event')
  @UseGuards(AuthAnalyticsGuard)
  async postEvent(@Req() request: Request) {
    try {
      await this.analyticsService.createEvent(
        request.header(TOKEN_HEADER_NAME),
        request.body,
      );
    } catch (ignore) {
      // потому что сейчас клиентская часть сильно меняется
    }
  }

  @Post('/user')
  @UseGuards(AuthAnalyticsGuard)
  postUser(@Req() request: Request) {
    this.analyticsService.createPlayer(
      request.header(TOKEN_HEADER_NAME),
      request.body,
    );
  }

  @Get('/last-internal-id')
  @UseGuards(AuthAnalyticsGuard)
  getLastInternalId(@Req() request: Request) {
    return this.analyticsService.getLastInternalId(
      request.header(TOKEN_HEADER_NAME),
    );
  }

  @Post('/scholar')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description:
      'Link scholars for user watch by TSV ro CSV wallet-discord columns',
  })
  linkScholar(
    @Body() requestDto: AnalyticsLinkPlayerRequestDto,
    @GetUser() user: User,
  ) {
    this.analyticsPlayersService.linkPlayersByTsvCsv(
      requestDto.text,
      requestDto.gameId,
      user.id,
    );
  }

  @Delete('/scholar')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Remove scholar from user favour list',
  })
  unlinkScholar(
    @Body() requestDto: AnalyticsUnlinkPlayerRequestDto,
    @GetUser() user: User,
  ) {
    this.analyticsPlayersService.unlinkPlayer(
      requestDto.wallet,
      requestDto.gameId,
      user.id,
    );
  }

  @Get('/info/common')
  @UseGuards(JwtAuthGuard)
  // @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Common analytics by game',
    type: AnalyticsInfoResponseColumnDto,
    isArray: true,
  })
  commonInfo(
    @Query() analyticsInfoRequestDto: AnalyticsInfoRequestDto,
    @GetUser() user: User,
  ) {
    return this.analyticsService.getCommonByGame(
      analyticsInfoRequestDto,
      user.id,
    );
  }

  @Get('/info/scholars')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Scholars analytics by game',
    type: AnalyticsPlayerDto,
    isArray: true,
  })
  scholarsInfo(
    @Query() analyticsInfoRequestDto: AnalyticsInfoRequestDto,
    @GetUser() user: User,
  ) {
    return this.analyticsService.getPlayersDataByGame(
      analyticsInfoRequestDto,
      user.id,
    );
  }
}
