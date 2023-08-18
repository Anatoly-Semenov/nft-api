import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { AnalyticsPlayer } from './entities/analytics-player.entity';
import { AnalyticsPlayerUser } from './entities/analytics-player-user.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

const EVENT_NAME_PVP_BATTLE_PLAYED = 'pvp_battle_played';
const EVENT_NAME_RACE_BATTLE_PLAYED = 'race_battle_played';

@Injectable()
export class AnalyticsEventsService {
  constructor(
    @InjectRepository(AnalyticsPlayer)
    private analyticsPlayerRepository: Repository<AnalyticsPlayer>,
    @InjectRepository(AnalyticsEvent)
    private analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(AnalyticsPlayerUser)
    private analyticsPlayerUserRepository: Repository<AnalyticsPlayerUser>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  getPvpMatchEvents(
    playerIdsFilter: string[],
    analyticsClientId: number,
    daysLimit: number,
  ) {
    if (playerIdsFilter.length === 0) {
      return [];
    }

    const datetime = moment();
    datetime.subtract(daysLimit, 'days');

    return this.analyticsEventRepository
      .createQueryBuilder()
      .where('"analyticsClientId" = :analyticsClientId', {
        analyticsClientId: analyticsClientId,
      })
      .andWhere('"eventName" = :eventName', {
        eventName: EVENT_NAME_PVP_BATTLE_PLAYED,
      })
      .andWhere('datetime >= :datetime', {
        datetime: datetime.format('YYYY-MM-DD HH:mm:ss'),
      })
      .andWhere('lower("playerId") IN (:...playerIds)', {
        playerIds: playerIdsFilter.map((item) => item.toLowerCase()),
      })
      .getMany();
  }

  getRaceMatchEvents(
    playerIdsFilter: string[],
    analyticsClientId: number,
    daysLimit: number,
  ) {
    if (playerIdsFilter.length === 0) {
      return [];
    }

    const datetime = moment();
    datetime.subtract(daysLimit, 'days');

    return this.analyticsEventRepository
      .createQueryBuilder()
      .where('"analyticsClientId" = :analyticsClientId', {
        analyticsClientId: analyticsClientId,
      })
      .andWhere('"eventName" = :eventName', {
        eventName: EVENT_NAME_RACE_BATTLE_PLAYED,
      })
      .andWhere('datetime >= :datetime', {
        datetime: datetime.format('YYYY-MM-DD HH:mm:ss'),
      })
      .andWhere('lower("playerId") IN (:...playerIds)', {
        playerIds: playerIdsFilter.map((item) => item.toLowerCase()),
      })
      .getMany();
  }
}
