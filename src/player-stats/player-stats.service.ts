import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PlayerStats } from './entities/player-stats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  FortniteStatsService,
  SERVICE_FORTNITE_STATS,
} from './services/fortnite-stats.service';
import { GamesService } from 'src/games/games.service';
import { GameCode } from 'src/games/entities/game.entity';
import {
  SERVICE_STEAM_STATS,
  SteamStatsService,
} from './services/steam-stats.service';

@Injectable()
export class PlayerStatsService {
  private readonly logger: Logger = new Logger(PlayerStatsService.name);

  constructor(
    @Inject(SERVICE_FORTNITE_STATS)
    private fortniteStatsService: FortniteStatsService,
    @Inject(SERVICE_STEAM_STATS)
    private steamStatsService: SteamStatsService,
    @InjectRepository(PlayerStats)
    private playerStatsRepository: Repository<PlayerStats>,
    private readonly gamesService: GamesService,
  ) {}

  getStats = async (gameId: number, user: User): Promise<PlayerStats> => {
    try {
      const game = await this.gamesService.findOne(gameId).catch((err) => {
        this.logger.error(new Error(err));

        throw err;
      });

      if (!game) {
        throw new NotFoundException(`Can not find game by game id: ${gameId}`);
      }

      let result = null;

      if (game.code === GameCode.FORTNITE) {
        result = await this.fortniteStatsService.getStats(user);
      }

      if (game.steam_id) {
        result = await this.steamStatsService.getStats(user, game);
      }

      if (!result) {
        throw new NotFoundException('Game statistic not found');
      }

      const stats = this.playerStatsRepository.create({
        game,
        result,
        user,
      });

      return this.playerStatsRepository.save(stats);
    } catch (error) {
      throw new BadRequestException(error);
    }
  };
}
