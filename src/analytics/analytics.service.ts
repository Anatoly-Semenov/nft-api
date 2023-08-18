import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsClient } from './entities/analytics-client.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsPlayer } from './entities/analytics-player.entity';
import { merge } from 'lodash';
import { AnalyticsInfoRequestDto } from './dto/analytics-info-request.dto';
import { AnalyticsPlayerDto } from './dto/analytics-player.dto';
import { GameDto } from '../games/dto/game.dto';
import { GameCode } from '../games/entities/game.entity';
import { IAnalyticsGameService } from './interfaces/analytics-game-service.interface';
import { SERVICE_CYBALL } from './services/cyball.service';
import { SERVICE_UNKNOWN_GAME } from './services/unknown-game.service';
import { GamesService } from '../games/games.service';
import { SERVICE_DRUNK_ROBOTS } from './services/drunk-robots.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsClient)
    private analyticsClientsRepository: Repository<AnalyticsClient>,
    @InjectRepository(AnalyticsEvent)
    private analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(AnalyticsPlayer)
    private analyticsPlayerRepository: Repository<AnalyticsPlayer>,
    @Inject(SERVICE_CYBALL) private cyballService: IAnalyticsGameService,
    @Inject(SERVICE_DRUNK_ROBOTS)
    private drunkRobotsService: IAnalyticsGameService,
    @Inject(SERVICE_UNKNOWN_GAME)
    private unknownGameService: IAnalyticsGameService,
    private readonly gamesService: GamesService,
  ) {}

  async createPlayer(apiKey: string, data: any) {
    const client = await this.getAnalyticsClient(apiKey);

    // if (client.id === 2) {
    //   this.logger.log(data);
    // }

    const { datetime, user } = data;
    let playerData = user;

    try {
      const previousPlayer = await this.getLastPlayerById(user?.id);

      if (previousPlayer) {
        playerData = merge(previousPlayer.data, user);
      }

      const analyticsPlayer = new AnalyticsPlayer();
      analyticsPlayer.analyticsClientId = client.id;
      analyticsPlayer.datetime = datetime ? datetime : new Date();
      analyticsPlayer.playerId = playerData?.id.toLowerCase();
      analyticsPlayer.data = playerData;

      this.analyticsPlayerRepository.save(analyticsPlayer);
    } catch (ignore) {
      // потому что сейчас клиентская часть сильно меняется
    }
  }

  async createEvent(apiKey: string, data: any) {
    const client = await this.getAnalyticsClient(apiKey);

    const { event, user, datetime } = data;

    if (user) {
      await this.createPlayer(apiKey, data);
    }

    let eventName;
    let eventData = null;
    if (typeof event === 'string') {
      eventName = event;
    } else {
      eventName = event?.name;
      eventData = event;
    }

    const analyticsEvent = new AnalyticsEvent();
    analyticsEvent.analyticsClientId = client.id;

    analyticsEvent.datetime = datetime ? datetime : new Date();
    analyticsEvent.eventName = eventName;
    analyticsEvent.playerId = user ? user.id.toLowerCase() : null;
    analyticsEvent.data = eventData;

    this.analyticsEventRepository.save(analyticsEvent);
  }

  getAnalyticsClient(apiKey: string): Promise<AnalyticsClient> {
    return this.analyticsClientsRepository.findOne({
      apiKey: apiKey,
    });
  }

  async isActiveClient(apiKey: string): Promise<boolean> {
    const client = await this.getAnalyticsClient(apiKey);

    return client && client.active;
  }

  async getCommonByGame(requestDto: AnalyticsInfoRequestDto, userId: number) {
    const game = await this.gamesService.findOne(requestDto.gameId);
    const gameService = this.getGameService(game);

    return gameService.getCommonData(requestDto, userId);
  }

  async getPlayersDataByGame(
    requestDto: AnalyticsInfoRequestDto,
    userId: number,
  ): Promise<AnalyticsPlayerDto[]> {
    const game = await this.gamesService.findOne(requestDto.gameId);
    const gameService = this.getGameService(game);

    return gameService.getPlayersData(requestDto, userId);
  }

  private async getLastPlayerById(playerId: string) {
    return await this.analyticsPlayerRepository.findOne({
      where: {
        playerId: playerId.toLowerCase(),
      },
      order: {
        datetime: 'DESC',
      },
    });
  }

  private getGameService(game: GameDto): IAnalyticsGameService {
    switch (game.code) {
      case GameCode.CYBALL:
        return this.cyballService;
      case GameCode.DRUNK_ROBOTS:
        return this.drunkRobotsService;
      default:
        return this.unknownGameService;
    }
  }

  async getLastInternalId(apiKey: string) {
    const result = {
      id: null,
    };

    const analyticsClient = await this.getAnalyticsClient(apiKey);
    if (!analyticsClient) {
      return result;
    }

    const data = await this.analyticsPlayerRepository
      .createQueryBuilder()
      .select("MAX((data->>'analyticsSystemId')::INT)", 'val')
      .where('"analyticsClientId" = :analyticsClientId', {
        analyticsClientId: analyticsClient.id,
      })
      .getRawOne();

    result.id = data?.val;

    return result;
  }
}
