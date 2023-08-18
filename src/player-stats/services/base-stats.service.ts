import { Game } from 'src/games/entities/game.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseGameStats } from './../interfaces/base-game-stats.interface';

export abstract class BaseStats<T> implements BaseGameStats<T> {
  abstract getStats: (user: User, game?: Game) => Promise<T>;
  abstract mapStats: (response: Record<string, any>) => T;
}
