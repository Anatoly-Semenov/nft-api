import { Injectable } from '@nestjs/common';
import { BaseGamesAbstract } from './base-games-abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsClientGame } from '../entities/analytics-client-game.entity';
import { AnalyticsPlayer } from '../entities/analytics-player.entity';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { AnalyticsInfoResponseColumnDto } from '../dto/analytics-info-response-column.dto';
import { AnalyticsPlayerUser } from '../entities/analytics-player-user.entity';
import { AnalyticsPlayersService } from '../analytics-players.service';
import { AnalyticsEventsService } from '../analytics-events.service';

export const SERVICE_DRUNK_ROBOTS = 'SERVICE_DRUNK_ROBOTS';

@Injectable()
export class DrunkRobotsService extends BaseGamesAbstract {
  constructor(
    @InjectRepository(AnalyticsClientGame)
    protected analyticsClientGameRepository: Repository<AnalyticsClientGame>,
    protected readonly analyticsPlayersService: AnalyticsPlayersService,
    protected readonly analyticsEventsService: AnalyticsEventsService,
  ) {
    super();
  }

  protected getAnalyticsCommonRow(data: any, playersCount: number) {
    const result = [];

    result.push(
      this.getFilledColumn(
        'total_scholars',
        'Total Scholars',
        'text',
        playersCount,
      ),
    );

    if (data['metal'] && data['metal'].currentValue) {
      data['metal'].currentValue =
        Math.round(data['metal'].currentValue * 100) / 100;
    }
    if (data['metal'] && data['metal'].deltaValue) {
      data['metal'].deltaValue =
        Math.round(data['metal'].deltaValue * 100) / 100;
    }
    result.push(data['metal']);

    if (data['pvp_metal'] && data['pvp_metal'].currentValue) {
      data['pvp_metal'].currentValue =
        Math.round(data['pvp_metal'].currentValue * 100) / 100;
    }
    if (data['pvp_metal'] && data['pvp_metal'].deltaValue) {
      data['pvp_metal'].deltaValue =
        Math.round(data['pvp_metal'].deltaValue * 100) / 100;
    }
    result.push(data['pvp_metal']);

    if (data['race_metal'] && data['race_metal'].currentValue) {
      data['race_metal'].currentValue =
        Math.round(data['race_metal'].currentValue * 100) / 100;
    }
    if (data['race_metal'] && data['race_metal'].deltaValue) {
      data['race_metal'].deltaValue =
        Math.round(data['race_metal'].deltaValue * 100) / 100;
    }
    result.push(data['race_metal']);

    const pvpFarmingColumn = data['pvp_farming'];
    pvpFarmingColumn.currentValue =
      Math.round(pvpFarmingColumn.currentValue / playersCount) || 'N/A';
    result.push(pvpFarmingColumn);

    const pvpMatchesColumn = data['pvp_matches'];
    // pvpMatchesColumn.currentValue =
    //   Math.round(pvpMatchesColumn.currentValue / playersCount) || 'N/A';
    result.push(pvpMatchesColumn);

    const pvpWinrateColumn = data['pvp_winrate'];
    pvpWinrateColumn.currentValue =
      Math.round(pvpWinrateColumn.currentValue / playersCount) || 'N/A';
    result.push(pvpWinrateColumn);

    const raceMatchesColumn = data['race_matches'];
    // raceMatchesColumn.currentValue =
    //   Math.round(raceMatchesColumn.currentValue / playersCount) || 'N/A';
    result.push(raceMatchesColumn);

    const raceWinrateColumn = data['race_winrate'];
    raceWinrateColumn.currentValue =
      Math.round(raceWinrateColumn.currentValue / playersCount) || 'N/A';
    result.push(raceWinrateColumn);

    return result;
  }

  protected getAnalyticsPlayerRow(
    analyticsPlayer: AnalyticsPlayerUser,
    player: AnalyticsPlayer,
    prevPlayer: AnalyticsPlayer,
    pvpPlayedEvents: AnalyticsEvent[],
    racePlayedEvents: AnalyticsEvent[],
  ) {
    const currentData: any = player?.data || {};
    const prevData: any = prevPlayer ? prevPlayer.data : {};
    const row: AnalyticsInfoResponseColumnDto[] = [];

    row.push(
      this.getFilledColumn(
        'wallet',
        'Wallet',
        'address',
        analyticsPlayer.analyticsPlayerPlayerId,
      ),
    );

    row.push(
      this.getFilledColumn(
        'discord',
        'Discord',
        'text',
        analyticsPlayer.discord,
      ),
    );

    row.push(
      this.getFilledColumn(
        'metal',
        'Metal',
        'coin',
        Math.round(currentData?.balance_metal * 100) / 100,
        Math.round(
          (currentData?.balance_metal - prevData?.balance_metal) * 100,
        ) / 100,
        'metal',
      ),
    );

    row.push(
      this.getFilledColumn(
        'pvp_metal',
        'PVP Metal',
        'coin',
        Math.round(currentData?.pvp_balance_metal * 100) / 100,
        Math.round(
          (currentData?.pvp_balance_metal - prevData?.pvp_balance_metal) * 100,
        ) / 100,
        'metal',
      ),
    );

    row.push(
      this.getFilledColumn(
        'race_metal',
        'Race Metal',
        'coin',
        Math.round(currentData?.race_balance_metal * 100) / 100,
        Math.round(
          (currentData?.race_balance_metal - prevData?.race_balance_metal) *
            100,
        ) / 100,
        'metal',
      ),
    );

    row.push(
      this.getFilledColumn(
        'pvp_farming',
        'PVP Farming per day',
        'text',
        currentData?.pvp_farming_per_day || 'N/A',
      ),
    );

    row.push(
      this.getFilledColumn(
        'pvp_rating',
        'PVP Rating',
        'text',
        currentData?.pvp_rating || 'N/A',
      ),
    );

    row.push(
      this.getFilledColumn(
        'pvp_matches',
        'PVP Matches Played',
        'text',
        pvpPlayedEvents.length,
      ),
    );

    let pvpWinrate = 0;
    if (pvpPlayedEvents.length > 0) {
      pvpWinrate =
        pvpPlayedEvents.filter((item) => {
          const data: any = item.data;
          return data.win === true;
        }).length / pvpPlayedEvents.length;

      pvpWinrate = Math.round(pvpWinrate * 100);
    }
    row.push(
      this.getFilledColumn(
        'pvp_winrate',
        'PVP Winrate',
        'percents',
        pvpWinrate,
      ),
    );

    row.push(
      this.getFilledColumn(
        'race_matches',
        'Race Matches Played',
        'text',
        racePlayedEvents.length,
      ),
    );

    let raceWinrate = 0;
    if (racePlayedEvents.length > 0) {
      raceWinrate =
        racePlayedEvents.filter((item) => {
          const data: any = item.data;
          return data.win === true;
        }).length / racePlayedEvents.length;

      raceWinrate = Math.round(raceWinrate * 100);
    }
    row.push(
      this.getFilledColumn(
        'race_winrate',
        'Race Winrate',
        'percents',
        raceWinrate,
      ),
    );

    return row;
  }
}
