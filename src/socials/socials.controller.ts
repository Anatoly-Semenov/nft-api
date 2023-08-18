import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/users/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { SocialStatsExtendedDto } from './dto/social-stats-extended.dto';
import { SocialStatsDto } from './dto/social-stats.dto';
import { SocialStatsAggregateAllQueryDto } from './dto/SocialStatsAggregateAllQuery.dto';
import { SocialStatsAggregationStopBodyDto } from './dto/SocialStatsAggregationStopBody.dto';
import { SocialServiceList } from './entities/social-channel.entity';
import { SocialsService } from './socials.service';

@ApiTags('Socials')
@ApiBearerAuth()
@Controller('/socials')
export class SocialsController {
  constructor(private readonly socialsService: SocialsService) {}

  @Get('/stats')
  @ApiQuery({
    name: 'gameId',
    required: true,
    description: 'Should be an id of game in database.',
    type: Number,
  })
  @ApiQuery({
    name: 'serviceName',
    required: true,
    description: `Should be one of [${Object.values(SocialServiceList).join(
      ',',
    )}]`,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Get social stats by id',
    type: SocialStatsExtendedDto,
  })
  async getStats(
    @Query('gameId') gameId: string,
    @Query('serviceName') serviceName: SocialServiceList,
  ): Promise<SocialStatsExtendedDto> {
    const stats = await this.socialsService.getSocialStats(
      +gameId,
      serviceName,
    );

    if (!stats) {
      throw new NotFoundException(`Can not find social stats by id: ${gameId}`);
    }

    return stats;
  }

  @Get('/stats/info')
  @ApiQuery({
    name: 'gameId',
    required: true,
    description: 'Should be an id of game in database.',
    type: Number,
  })
  @ApiQuery({
    name: 'serviceName',
    required: true,
    description: `Should be one of [${Object.values(SocialServiceList).join(
      ',',
    )}]`,
    type: String,
  })
  @ApiQuery({
    name: 'take',
    description: 'Number of elements to returns.',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Get social stats info for game & channel',
    type: SocialStatsDto,
    isArray: true,
  })
  async getStatsInfo(
    @Query('gameId') gameId: string,
    @Query('serviceName') serviceName: SocialServiceList,
    @Query('take') take: string,
  ): Promise<SocialStatsDto[]> {
    const takeValue = take ? +take : 20;

    const statsList = await this.socialsService.getSocialStatsList(+gameId, {
      service: serviceName,
      take: takeValue,
    });

    return statsList;
  }

  @Post('/stats/aggregation-stop')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  async aggregationStop(@Body() body: SocialStatsAggregationStopBodyDto) {
    body.services =
      body.services ||
      [
        SocialServiceList.TWITTER,
        SocialServiceList.TELEGRAM,
        SocialServiceList.DISCORD,
      ].join(',');

    const services = body.services
      .split(',')
      .filter((i) => !!SocialServiceList[i])
      .map((i) => SocialServiceList[i]);

    return this.socialsService.aggregationStop(services as SocialServiceList[]);
  }

  @Get('/stats/aggregate-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiQuery({
    name: 'services',
    required: false,
    description: `Select services for aggregation [${Object.values(
      SocialServiceList,
    ).join(',')}]`,
    type: String,
  })
  async aggregateAll(@Query() query: SocialStatsAggregateAllQueryDto) {
    query.services =
      query.services ||
      [
        SocialServiceList.TWITTER,
        SocialServiceList.TELEGRAM,
        SocialServiceList.DISCORD,
      ].join(',');

    const services = query.services
      .split(',')
      .filter((i) => !!SocialServiceList[i])
      .map((i) => SocialServiceList[i]);

    return this.socialsService.aggregateAll(services as SocialServiceList[]);
  }

  @Get('/link')
  @ApiQuery({
    name: 'gameId',
    required: true,
    description: 'Should be an id of game in database.',
    type: Number,
  })
  @ApiQuery({
    name: 'serviceName',
    required: true,
    description: `Should be one of [${Object.values(SocialServiceList).join(
      ',',
    )}]`,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Get social link by game id * social name',
    type: String,
  })
  async getSocialLink(
    @Query('gameId') gameId: string,
    @Query('serviceName') serviceName: SocialServiceList,
  ): Promise<string> {
    return this.socialsService.getSocialLink(+gameId, serviceName);
  }
}
