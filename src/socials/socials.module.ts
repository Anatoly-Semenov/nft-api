import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialProcessorList } from 'src/types';
import { SocialChannel } from './entities/social-channel.entity';
import { SocialSession } from './entities/social-session.entity';
import { SocialStats } from './entities/social-stats.entity';
import { SocialDiscordProcessor } from './processors/discord.processor';
import { SocialTelegramProcessor } from './processors/telegram.processor';
import { SocialTwitterProcessor } from './processors/twitter.processor';
import {
  SCHEDULER_SOCIAL_DISCORD,
  SocialDiscordScheduler,
} from './schedulers/discord.scheduler';
import { SCHEDULER_SOCIAL_TELEGRAM } from './schedulers/telegram.scheduler';
import {
  SCHEDULER_SOCIAL_TWITTER,
  SocialTwitterScheduler,
} from './schedulers/twitter.scheduler';
import {
  SERVICE_SOCIAL_DISCORD,
  SocialDiscordService,
} from './services/discord.service';
import {
  SERVICE_SOCIAL_TELEGRAM,
  SocialTelegramService,
} from './services/telegram.service';
import {
  SERVICE_SOCIAL_TWITTER,
  SocialTwitterService,
} from './services/twitter.service';
import {
  SERVICE_SOCIAL_UNKNOWN,
  SocialUnknownService,
} from './services/unknown.service';
import { SocialsController } from './socials.controller';
import { SocialsService } from './socials.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialStats, SocialChannel, SocialSession]),
    BullModule.registerQueue(
      { name: SocialProcessorList.DISCORD },
      { name: SocialProcessorList.TWITTER },
      { name: SocialProcessorList.TELEGRAM },
    ),
    HttpModule,
    ConfigModule,
  ],
  controllers: [SocialsController],
  providers: [
    SocialsService,
    SocialDiscordProcessor,
    SocialTwitterProcessor,
    SocialTelegramProcessor,
    {
      provide: SERVICE_SOCIAL_TWITTER,
      useClass: SocialTwitterService,
    },
    {
      provide: SERVICE_SOCIAL_DISCORD,
      useClass: SocialDiscordService,
    },
    {
      provide: SERVICE_SOCIAL_TELEGRAM,
      useClass: SocialTelegramService,
    },
    {
      provide: SERVICE_SOCIAL_UNKNOWN,
      useClass: SocialUnknownService,
    },
    {
      provide: SCHEDULER_SOCIAL_TWITTER,
      useClass: SocialTwitterScheduler,
    },
    {
      provide: SCHEDULER_SOCIAL_DISCORD,
      useClass: SocialDiscordScheduler,
    },
    {
      provide: SCHEDULER_SOCIAL_TELEGRAM,
      useClass: SocialTelegramService,
    },
  ],
  exports: [SocialsService],
})
export class SocialsModule {}
