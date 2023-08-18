import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseStats } from './base-stats.service';
import { User } from 'src/users/entities/user.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Game } from 'src/games/entities/game.entity';
import { SteamStatsResponseDto } from '../dto/steam-stats-response.dto';

export const SERVICE_STEAM_STATS = 'SERVICE_STEAM_STATS';

@Injectable()
export class SteamStatsService extends BaseStats<SteamStatsResponseDto> {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  public mapStats = (response: Record<string, any>): SteamStatsResponseDto => {
    const { stats, achievements, appid } = response;

    if (!stats || !achievements) {
      throw new BadRequestException();
    }

    const result: SteamStatsResponseDto = {
      appid,
      stats: {},
      achievements: {},
    };

    Object.entries(stats as Record<string, any>).forEach(([property, stat]) => {
      result.stats[property] = stat.value;
    });

    Object.entries(achievements as Record<string, any>).forEach(
      ([property, achievement]) => {
        result.achievements[property] = achievement.achieved;
      },
    );

    return result;
  };

  public getStats = async (
    user: User,
    game: Game,
  ): Promise<SteamStatsResponseDto> => {
    const profile = user.steam;

    if (!profile?.id) {
      throw new BadRequestException('You need to connect an Steam account');
    }

    if (!game?.steam_id) {
      throw new BadRequestException(
        "Game doesn't have a Steam id to get user achievements",
      );
    }

    const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0001/`;

    const result = await firstValueFrom(
      this.httpService.get(url, {
        params: {
          key: process.env.STEAM_API_KEY,
          appid: game.steam_id,
          steamid: profile.id,
          l: 'en',
        },
      }),
    );

    if (!result?.data?.playerstats) {
      throw new BadRequestException('Error getting user stats on Steam');
    }

    return this.mapStats({ ...result.data.playerstats, appid: game.steam_id });
  };
}
