import { Achievement } from 'src/achievements/entities/achievement.entity';
import { Game } from 'src/games/entities/game.entity';
import { User } from 'src/users/entities/user.entity';

export enum AchievementProcessorList {
  HandleOnChain = 'handle-on-chain-achievements-processor',
  ParseSteamAchievements = 'parse-steam-achievements',
}

export enum AchievementQueueList {
  HandleOnChain = 'handle-on-chain-achievements-queue',
  HandleCsv = 'handle-csv-achievements',
  ParseSteamAchievements = 'parse-steam-achievements',
}

export enum AchievementCacheKeyList {
  HandleOnChain = 'handle-on-chain-achievements-processing',
}

export type AchievementOnChainJobData = {
  userId: User['id'];
  gameIds: Game['id'][];
  total: number;
  current: number;
};

export type AchievementCsvJobData = {
  user: User;
  games: Game[];
  achievement: Achievement;
  total: number;
  current: number;
};
