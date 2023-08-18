import { Injectable } from '@nestjs/common';
import { BaseGamesAbstract } from './base-games-abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticsClientGame } from '../entities/analytics-client-game.entity';
import { Repository } from 'typeorm';
import { AnalyticsPlayer } from '../entities/analytics-player.entity';
import { AnalyticsInfoResponseColumnDto } from '../dto/analytics-info-response-column.dto';
import { AnalyticsPlayerUser } from '../entities/analytics-player-user.entity';

export const SERVICE_CYBALL = 'SERVICE_CYBALL';

@Injectable()
export class CyballService extends BaseGamesAbstract {
  constructor(
    @InjectRepository(AnalyticsClientGame)
    protected analyticsClientGameRepository: Repository<AnalyticsClientGame>,
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

    result.push(data['earned']);

    return result;
  }

  protected getAnalyticsPlayerRow(
    analyticsPlayer: AnalyticsPlayerUser,
    player: AnalyticsPlayer,
    prevPlayer: AnalyticsPlayer,
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
        'earned',
        'Earned',
        'coin',
        Math.round(currentData?.earned * 100) / 100,
        Math.round((currentData?.earned - prevData?.earned) * 100) / 100,
        'CBT',
      ),
    );

    return row;
  }
}
