import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsClient } from './entities/analytics-client.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsPlayer } from './entities/analytics-player.entity';
import { AuthAnalyticsGuard } from './auth-analytics-guard.service';
import { AnalyticsClientGame } from './entities/analytics-client-game.entity';
import { AnalyticsPlayerUser } from './entities/analytics-player-user.entity';
import { AnalyticsPlayersService } from './analytics-players.service';
import { AnalyticsEventsService } from './analytics-events.service';
import { CyballService, SERVICE_CYBALL } from './services/cyball.service';
import {
  SERVICE_UNKNOWN_GAME,
  UnknownGameService,
} from './services/unknown-game.service';
import { GamesModule } from '../games/games.module';
import {
  DrunkRobotsService,
  SERVICE_DRUNK_ROBOTS,
} from './services/drunk-robots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsClient,
      AnalyticsEvent,
      AnalyticsPlayer,
      AnalyticsClientGame,
      AnalyticsPlayerUser,
    ]),
    GamesModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsPlayersService,
    AnalyticsEventsService,
    AuthAnalyticsGuard,
    {
      useClass: CyballService,
      provide: SERVICE_CYBALL,
    },
    {
      useClass: DrunkRobotsService,
      provide: SERVICE_DRUNK_ROBOTS,
    },
    {
      useClass: UnknownGameService,
      provide: SERVICE_UNKNOWN_GAME,
    },
  ],
})
export class AnalyticsModule {}
