import { Game } from '../../games/entities/game.entity';
import { User } from '../../users/entities/user.entity';
import { AchievementRuleExtended } from '../services/achievements-onchain.service';

export class AchievementHandlerDto {
  gameId: Game['id'];
  rule: AchievementRuleExtended;
  user: User;
  walletAddresses: string[];

  constructor(partial?: Partial<AchievementHandlerDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
