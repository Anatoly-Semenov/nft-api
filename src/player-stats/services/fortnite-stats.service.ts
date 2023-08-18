import { BadRequestException, Injectable } from '@nestjs/common';
import { FortniteStatsResponseDto } from '../dto/fortnite-stats-response.dto';
import { BaseStats } from './base-stats.service';
import * as FortniteAPI from 'fortnite-api-com';
import { User } from 'src/users/entities/user.entity';

export const SERVICE_FORTNITE_STATS = 'SERVICE_FORTNITE_STATS';
@Injectable()
export class FortniteStatsService extends BaseStats<FortniteStatsResponseDto> {
  private client = new FortniteAPI({
    apikey: process.env.FORTNITE_API_KEY,
    language: 'en',
    debug: true,
  });

  public mapStats = (
    response: Record<string, any>,
  ): FortniteStatsResponseDto => {
    const overallStats = response.data.stats.all.overall;

    if (!overallStats) {
      throw new BadRequestException();
    }

    return overallStats;
  };

  public getStats = (user: User): Promise<FortniteStatsResponseDto> => {
    const profile = user.epicGames;

    if (!profile?.id) {
      throw new BadRequestException(
        'You need to connect an Epic Games account',
      );
    }

    return new Promise((resolve, reject) => {
      this.client
        .BRStatsID(profile.id, {
          accountType: 'epic',
          timeWindow: 'lifetime',
          image: 'none',
        })
        .then((res) => {
          if (res.status === 200) {
            resolve(this.mapStats(res));
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
