import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { AnalyticsPlayer } from './entities/analytics-player.entity';
import { AnalyticsPlayerUser } from './entities/analytics-player-user.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

@Injectable()
export class AnalyticsPlayersService {
  constructor(
    @InjectRepository(AnalyticsPlayer)
    private analyticsPlayerRepository: Repository<AnalyticsPlayer>,
    @InjectRepository(AnalyticsPlayerUser)
    private analyticsPlayerUserRepository: Repository<AnalyticsPlayerUser>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  linkPlayersByTsvCsv(text: string, gameId: number, userId: number) {
    // TSV or CSV
    const delimiter = text.indexOf('\t') >= 0 ? '\t' : ',';

    text.split('\n').map((row) => {
      const [wallet, discord] = row.split(delimiter);
      if (wallet && discord) {
        this.linkPlayer(wallet, discord, gameId, userId);
      }
    });
  }

  unlinkPlayer(wallet: string, gameId: number, userId: number) {
    const entity = new AnalyticsPlayerUser();
    entity.analyticsPlayerPlayerId = wallet.toLowerCase();
    entity.userId = userId;
    entity.gameId = gameId;

    this.analyticsPlayerUserRepository.findOne(entity).then((exists) => {
      this.analyticsPlayerUserRepository.delete(exists);
    });
  }

  getPlayersByUser(userId: number, gameId: number) {
    return this.analyticsPlayerUserRepository.find({
      where: {
        userId: userId,
        gameId: gameId,
      },
      order: {
        analyticsPlayerPlayerId: 'ASC',
      },
    });
  }

  async getPlayersLastDataIds(
    playerIdsFilter: string[],
    analyticsClientId: number,
    daysLimit: number,
  ) {
    if (playerIdsFilter.length === 0) {
      return [];
    }

    const playersIdsInCondition = (
      "'" +
      playerIdsFilter.join("', '") +
      "'"
    ).toLowerCase();

    const datetime = moment();
    datetime.subtract(daysLimit, 'days');

    // language=PostgreSQL
    const query = `
        SELECT MAX(id) AS id
        FROM analytics_player au
                 JOIN (SELECT "playerId", max(datetime) as datetime
                       FROM analytics_player
                       WHERE lower("playerId") IN (${playersIdsInCondition})
                       GROUP BY "playerId") au2 ON lower(au."playerId") = lower(au2."playerId") AND au.datetime = au2.datetime
        WHERE au."analyticsClientId" = $1
          AND au.datetime >= $2
        GROUP BY au."playerId"
    `;

    return (
      await this.connection.query(query, [
        analyticsClientId,
        datetime.format('YYYY-MM-DD HH:mm:ss'),
      ])
    ).map((item) => item.id);
  }

  async getPlayersPrevDataIds(
    playerIdsFilter: string[],
    idsNotFilter: number[],
    analyticsClientId: number,
    daysLimit: number,
  ) {
    if (playerIdsFilter.length === 0) {
      return [];
    }
    const playersIdsInCondition = (
      "'" +
      playerIdsFilter.join("', '") +
      "'"
    ).toLowerCase();

    const idsNotInCondition = idsNotFilter.length
      ? idsNotFilter.join(', ')
      : 'null';

    const datetime = moment();
    datetime.subtract(daysLimit, 'days');

    // language=PostgreSQL
    const query = `
        SELECT MAX(id) AS id
        FROM analytics_player au
                 JOIN (SELECT "playerId", max(datetime) as datetime
                       FROM analytics_player
                       WHERE lower("playerId") IN (${playersIdsInCondition})
                         AND id NOT IN (${idsNotInCondition})
                         AND datetime <= $2
                       GROUP BY "playerId") au2 ON lower(au."playerId") = lower(au2."playerId") AND au.datetime = au2.datetime
        WHERE au."analyticsClientId" = $1 AND au.datetime <= $2
        GROUP BY au."playerId";
    `;

    return (
      await this.connection.query(query, [
        analyticsClientId,
        datetime.format('YYYY-MM-DD HH:mm:ss'),
      ])
    ).map((item) => item.id);
  }

  getPlayersByIdList(idList: number[]) {
    if (idList.length === 0) {
      return [];
    }

    return this.analyticsPlayerRepository
      .createQueryBuilder()
      .where('id IN (:...ids)', {
        ids: idList,
      })
      .getMany();
  }

  private linkPlayer(
    wallet: string,
    discord: string,
    gameId: number,
    userId: number,
  ) {
    const entity = new AnalyticsPlayerUser();
    entity.analyticsPlayerPlayerId = wallet.toLowerCase();
    entity.userId = userId;
    entity.gameId = gameId;

    this.analyticsPlayerUserRepository.findOne(entity).then((exists) => {
      if (!exists) {
        entity.discord = discord;
        this.analyticsPlayerUserRepository.save(entity);
      }
    });
  }
}
