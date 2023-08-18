import { IAnalyticsGameService } from '../interfaces/analytics-game-service.interface';
import { AnalyticsInfoRequestDto } from '../dto/analytics-info-request.dto';
import { AnalyticsInfoResponseColumnDto } from '../dto/analytics-info-response-column.dto';
import { AnalyticsPlayer } from '../entities/analytics-player.entity';
import { AnalyticsPlayerUser } from '../entities/analytics-player-user.entity';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { AnalyticsPlayerDto } from '../dto/analytics-player.dto';

export abstract class BaseGamesAbstract implements IAnalyticsGameService {
  protected analyticsClientGameRepository;
  protected analyticsPlayersService;
  protected analyticsEventsService;

  protected abstract getAnalyticsPlayerRow(
    analyticsPlayer: AnalyticsPlayerUser,
    player: AnalyticsPlayer,
    prevPlayer: AnalyticsPlayer,
    pvpPlayedEvents: AnalyticsEvent[],
    racePlayedEvents: AnalyticsEvent[],
  );

  protected abstract getAnalyticsCommonRow(data: any, playersCount: number);

  async getCommonData(requestDto: AnalyticsInfoRequestDto, userId: number) {
    const playersDataByGame = await this.getPlayersData(requestDto, userId);

    const data: any = {};

    if (!playersDataByGame) {
      return data;
    }

    for (const player of playersDataByGame) {
      for (const column of player.columns) {
        if (['wallet', 'discord'].indexOf(column.id) >= 0) {
          continue;
        }

        if (!data[column.id]) {
          data[column.id] = column;
          if (!data[column.id].currentValue) {
            data[column.id].currentValue = 0;
          }
          if (!data[column.id].deltaValue) {
            data[column.id].deltaValue = 0;
          }
        } else {
          if (column.currentValue) {
            data[column.id].currentValue += column.currentValue;
          }
          if (column.deltaValue) {
            data[column.id].deltaValue += column.deltaValue;
          }
        }
      }
    }

    if (Object.values(data).length === 0) {
      return [];
    }

    return this.getAnalyticsCommonRow(data, playersDataByGame.length);
  }

  async getPlayersData(requestDto: AnalyticsInfoRequestDto, userId: number) {
    const commonServiceData = await this.getPlayersCollectionsForCalculations(
      requestDto,
      userId,
    );

    // stop if requirements not satisfied
    if (!commonServiceData) {
      return [];
    }

    const [
      analyticsPlayersUser,
      lastPlayersData,
      prevPlayersData,
      pvpPlayedEvents,
      racePlayedEvents,
    ] = commonServiceData;

    // stop if requirements not satisfied
    if (analyticsPlayersUser.length === 0) {
      return [];
    }

    // get aggregated data
    return this.getAnalyticsByPlayers(
      analyticsPlayersUser,
      lastPlayersData,
      prevPlayersData,
      pvpPlayedEvents,
      racePlayedEvents,
    );
  }

  protected getFilledColumn(
    id,
    title,
    type,
    value,
    delta = null,
    units = null,
  ) {
    const column = new AnalyticsInfoResponseColumnDto();
    column.id = id;
    column.title = title;
    column.type = type;
    column.currentValue =
      value && !isNaN(value) && type !== 'address' ? parseFloat(value) : value;
    column.deltaValue =
      delta && !isNaN(delta) && type !== 'address' ? parseFloat(delta) : delta;
    column.units = units;

    return column;
  }

  private findPlayerById(playerId: string, playerList: AnalyticsPlayer[]) {
    return playerList.find((item) => item.playerId === playerId);
  }

  private getAnalyticsByPlayers(
    analyticPlayersUser: AnalyticsPlayerUser[],
    lastPlayersData: AnalyticsPlayer[],
    prevPlayersData: AnalyticsPlayer[],
    pvpPlayedEvents: AnalyticsEvent[],
    racePlayedEvents: AnalyticsEvent[],
  ) {
    const result = [];

    for (const analyticsPlayer of analyticPlayersUser) {
      const player = this.findPlayerById(
        analyticsPlayer.analyticsPlayerPlayerId,
        lastPlayersData,
      );
      const prevPlayer = this.findPlayerById(
        analyticsPlayer.analyticsPlayerPlayerId,
        prevPlayersData,
      );

      const analyticsPlayerDto = new AnalyticsPlayerDto();

      analyticsPlayerDto.columns = this.getAnalyticsPlayerRow(
        analyticsPlayer,
        player,
        prevPlayer,
        pvpPlayedEvents.filter(
          (item) => item.playerId === analyticsPlayer.analyticsPlayerPlayerId,
        ),
        racePlayedEvents.filter(
          (item) => item.playerId === analyticsPlayer.analyticsPlayerPlayerId,
        ),
      );

      result.push(analyticsPlayerDto);
    }

    return result;
  }

  private async getPlayersCollectionsForCalculations(
    requestDto: AnalyticsInfoRequestDto,
    userId: number,
  ) {
    // get analytics clients as filer by game and players which user has watch
    const [analyticsClient, analyticsPlayersUser] = await Promise.all([
      this.analyticsClientGameRepository.findOne({
        gameId: requestDto.gameId,
      }),
      this.analyticsPlayersService.getPlayersByUser(userId, requestDto.gameId),
    ]);

    // stop if requirements not satisfied
    if (!analyticsClient || analyticsPlayersUser.length === 0) {
      return null;
    }

    // get the latest (with max datetime) analytics player data
    const playerLastDataIds =
      await this.analyticsPlayersService.getPlayersLastDataIds(
        analyticsPlayersUser.map((item) => item.analyticsPlayerPlayerId),
        analyticsClient.analyticsClientId,
        requestDto.days,
      );

    // get previous analytics player data (based on id list from previous method)
    const playerPrevDataIds =
      await this.analyticsPlayersService.getPlayersPrevDataIds(
        analyticsPlayersUser.map((item) => item.analyticsPlayerPlayerId),
        playerLastDataIds,
        analyticsClient.analyticsClientId,
        requestDto.days,
      );

    // get completely lists for the latest players data and previous players data
    return Promise.all([
      analyticsPlayersUser,
      this.analyticsPlayersService.getPlayersByIdList(playerLastDataIds),
      this.analyticsPlayersService.getPlayersByIdList(playerPrevDataIds),
      this.analyticsEventsService.getPvpMatchEvents(
        analyticsPlayersUser.map((item) => item.analyticsPlayerPlayerId),
        analyticsClient.analyticsClientId,
        requestDto.days,
      ),
      this.analyticsEventsService.getRaceMatchEvents(
        analyticsPlayersUser.map((item) => item.analyticsPlayerPlayerId),
        analyticsClient.analyticsClientId,
        requestDto.days,
      ),
    ]);
  }
}
