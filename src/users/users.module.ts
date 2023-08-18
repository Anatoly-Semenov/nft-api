import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordStrategy } from 'src/auth/strategies/discord.strategy';
import { PlayerStatsModule } from 'src/player-stats/player-stats.module';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { GamesModule } from 'src/games/games.module';
import { HttpModule } from '@nestjs/axios';
import { UserWallet } from './entities/user-wallet.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserSharingSubscription } from './entities/user-sharing-subscription.entity';
import { UserBalanceRecord } from './entities/user-balance-record.entity';
import { SolanaWalletService } from './services/solana-wallet.service';
import { UserMintedAchievement } from './entities/user-minted-achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserWallet,
      UserAchievement,
      UserMintedAchievement,
      UserSharingSubscription,
      UserBalanceRecord,
      UserMintedAchievement,
    ]),
    PlayerStatsModule,
    AchievementsModule,
    GamesModule,
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, DiscordStrategy, SolanaWalletService],
  exports: [UsersService],
})
export class UsersModule {}
