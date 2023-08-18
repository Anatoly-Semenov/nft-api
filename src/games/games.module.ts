import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GameInfoAggregated } from './entities/game-info-aggregated.entity';
import { SocialsModule } from 'src/socials/socials.module';
import { GameAdditionalInfo } from './entities/game-additional-info.entity';
import { CsvModule } from 'nest-csv-parser';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameInfoAggregated, GameAdditionalInfo]),
    MulterModule.register({
      dest: './upload',
    }),
    ScheduleModule.forRoot(),
    ConfigModule,
    HttpModule,
    SocialsModule,
    CsvModule,
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
