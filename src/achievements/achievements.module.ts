import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { AchievementsOnChainService } from './services/achievements-onchain.service';
import { ChainParserModule } from 'src/chain-parser/chain-parser.module';
import { BullModule } from '@nestjs/bull';
import { AchievementProcessorList } from 'src/types/achievement';
import { AchievementsOnChainConsumer } from './jobs/consumers/achievements-on-chain.consumer';
import { AchievementProgress } from './entities/achievement-progress.entity';
import { CsvModule } from 'nest-csv-parser';
import { MulterModule } from '@nestjs/platform-express';
import { SteamAchievement } from './entities/steam-achievement.entity';
import { GamesModule } from 'src/games/games.module';
import { SteamAchievementsService } from './services/steam-achievements.service';
import { SteamAchievementsConsumer } from './jobs/consumers/steam-achievements.consumer';
import { HttpModule } from '@nestjs/axios';
import { AchievementNftsController } from './achievement-nfts.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Achievement,
      AchievementProgress,
      SteamAchievement,
    ]),
    BullModule.registerQueue({
      name: AchievementProcessorList.HandleOnChain,
      limiter: { max: 100, duration: 50000, bounceBack: false },
    }),
    BullModule.registerQueue({
      name: AchievementProcessorList.ParseSteamAchievements,
    }),
    ChainParserModule,
    GamesModule,
    HttpModule,
    MulterModule.register({
      dest: './upload',
    }),
    CsvModule,
    HttpModule,
  ],
  providers: [
    AchievementsService,
    AchievementsOnChainConsumer,
    SteamAchievementsConsumer,
    {
      provide: AchievementsOnChainService.name,
      useClass: AchievementsOnChainService,
    },
    SteamAchievementsService,
  ],
  controllers: [AchievementsController, AchievementNftsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
