import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SteamAchievementsService } from 'src/achievements/services/steam-achievements.service';
import { Game } from 'src/games/entities/game.entity';
import {
  AchievementProcessorList,
  AchievementQueueList,
} from 'src/types/achievement';

@Processor(AchievementProcessorList.ParseSteamAchievements)
export class SteamAchievementsConsumer {
  private readonly logger = new Logger(SteamAchievementsConsumer.name);

  constructor(
    private readonly steamAchievementsService: SteamAchievementsService,
  ) {}

  @Process({
    name: AchievementQueueList.ParseSteamAchievements,
    concurrency: 10,
  })
  async parseSteamAchievements(job: Job<Game>): Promise<void> {
    const game = job?.data;

    await this.steamAchievementsService.parseSteamAchievements(game);
  }

  @OnQueueCompleted()
  async onAchievementsJobCompleted(job: Job<Game>) {
    const game = job?.data;

    this.logger.log(`Got ${game.title}(ID: ${game.id}) achievements on steam`);
  }

  @OnQueueFailed()
  async onAchievementsJobFailed(job: Job<Game>) {
    const game = job?.data;

    this.logger.error(
      `Can't get ${game.title}(ID: ${game.id}) achievements on steam`,
    );
  }
}
