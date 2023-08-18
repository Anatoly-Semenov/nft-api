import { User } from 'src/users/entities/user.entity';

export interface BaseGameStats<T> {
  getStats: (user: User) => Promise<T>;
  mapStats: (response: Record<string, any>) => T;
}
