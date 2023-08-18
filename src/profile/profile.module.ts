import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity
import { ProfileMoralisLogs } from './entities/profile-moralis-logs.entity';

// Controller
import { ProfileController } from './profile.controller';

// Service
import { ProfileService } from './profile.service';

// Module
import { AchievementsModule } from 'src/achievements/achievements.module';
import { ChainParserModule } from 'src/chain-parser/chain-parser.module';
import { GamesModule } from 'src/games/games.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileConsumer } from './jobs/consumers/profile.consumer';
import { ProfileScheduler } from './jobs/shedulers/profile.sheduler';
import { BullModule } from '@nestjs/bull';
import { ProfileProcessorList } from './types';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileMoralisLogs]),
    HttpModule,
    UsersModule,
    GamesModule,
    AchievementsModule,
    ChainParserModule,
    ConfigModule,
    BullModule.registerQueue({
      name: ProfileProcessorList.FetchMintedAchievements,
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileConsumer, ProfileScheduler],
  exports: [ProfileService],
})
export class ProfileModule {}
