import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ArticlesModule } from './articles/articles.module';
import { CommonModule } from './common/common.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';
import { AchievementsModule } from './achievements/achievements.module';
import MainConfig from './common/config/main.config';
import { SocialsModule } from './socials/socials.module';
import { AirdropsModule } from './airdrops/airdrops.module';
import { GiveawaysModule } from './giveaways/giveaways.module';
import { ProfileModule } from './profile/profile.module';
import { SolanaModule } from './solana/solana.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ChainParserModule } from './chain-parser/chain-parser.module';
import { BullModule } from '@nestjs/bull';
import { RewardsModule } from './rewards/rewards.module';
import { MessengerModule } from './messenger/messenger.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [MainConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
    CacheModule.register({
      ttl: 0,
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    GamesModule,
    ArticlesModule,
    SocialsModule,
    AnalyticsModule,
    PlayerStatsModule,
    AchievementsModule,
    AirdropsModule,
    GiveawaysModule,
    ProfileModule,
    SolanaModule,
    FeedbackModule,
    ChainParserModule,
    RewardsModule,
    MessengerModule,
    ReferralModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
