import { Module } from '@nestjs/common';
import { PlayerStatsController } from './player-stats.controller';
import { PlayerStatsService } from './player-stats.service';
import {
  FortniteStatsService,
  SERVICE_FORTNITE_STATS,
} from './services/fortnite-stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerStats } from './entities/player-stats.entity';
import { GamesModule } from 'src/games/games.module';
import { HttpModule } from '@nestjs/axios';
import {
  SERVICE_STEAM_STATS,
  SteamStatsService,
} from './services/steam-stats.service';

@Module({
  imports: [GamesModule, TypeOrmModule.forFeature([PlayerStats]), HttpModule],
  controllers: [PlayerStatsController],
  providers: [
    PlayerStatsService,
    {
      useClass: FortniteStatsService,
      provide: SERVICE_FORTNITE_STATS,
    },
    {
      useClass: SteamStatsService,
      provide: SERVICE_STEAM_STATS,
    },
  ],
  exports: [PlayerStatsService],
})
export class PlayerStatsModule {}
