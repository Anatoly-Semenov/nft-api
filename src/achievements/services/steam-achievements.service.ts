import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { firstValueFrom } from 'rxjs';
import { Game } from 'src/games/entities/game.entity';
import { GamesService } from 'src/games/games.service';
import {
  AchievementProcessorList,
  AchievementQueueList,
} from 'src/types/achievement';
import { IsNull, Not, Repository } from 'typeorm';
import { SteamAchievement } from '../entities/steam-achievement.entity';

@Injectable()
export class SteamAchievementsService {
  private readonly logger = new Logger(SteamAchievementsService.name);

  constructor(
    @InjectRepository(SteamAchievement)
    private readonly steamAchievementRepository: Repository<SteamAchievement>,
    private readonly gamesService: GamesService,
    private readonly httpService: HttpService,
    @InjectQueue(AchievementProcessorList.ParseSteamAchievements)
    private readonly achievementQueue: Queue,
  ) {}

  async parseSteamAchievements(game: Game): Promise<SteamAchievement[]> {
    if (!process.env.STEAM_API_KEY) {
      throw new BadRequestException('Steam api key not found');
    }

    if (!game.steam_id) {
      throw new BadRequestException(
        "Game doesn't have a steam id to parse achievements",
      );
    }

    const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/`;

    const result = await firstValueFrom(
      this.httpService.get(url, {
        params: {
          key: process.env.STEAM_API_KEY,
          appid: game.steam_id,
          l: 'english',
          format: 'json',
        },
      }),
    );

    const { achievements } = result.data?.game?.availableGameStats || {};

    const steamAchievementsQueries = achievements.map(
      ({ name, displayName = '', description = '', icon = '' }) =>
        this.steamAchievementRepository.create({
          name,
          displayName,
          description,
          image: icon,
          steamAppId: game.steam_id,
          game,
        }),
    );

    const steamAchievements = await this.steamAchievementRepository.save(
      steamAchievementsQueries,
    );

    return steamAchievements.map((el) => {
      delete el.game;

      return el;
    });
  }

  async getListByGameId(gameId: number): Promise<SteamAchievement[]> {
    const game = await this.gamesService.findOne(gameId, ['steamAchievements']);

    if (game.steamAchievements?.length) {
      return game.steamAchievements;
    }

    return this.parseSteamAchievements(game);
  }

  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  // async parseSteamAchievementsForAllGames() {
  //   const games = await this.gamesService.find({ steam_id: Not(IsNull()) }, [
  //     'steamAchievements',
  //   ]);

  //   games
  //     .filter((game) => !game.steamAchievements.length)
  //     .forEach((game) => {
  //       this.achievementQueue.add(
  //         AchievementQueueList.ParseSteamAchievements,
  //         game,
  //         {
  //           removeOnFail: true,
  //           removeOnComplete: true,
  //         },
  //       );
  //     });
  // }
}
