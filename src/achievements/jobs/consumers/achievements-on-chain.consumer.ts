import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { createObjectCsvWriter } from 'csv-writer';
import { CsvWriter } from 'csv-writer/src/lib/csv-writer';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import { AchievementProgress } from 'src/achievements/entities/achievement-progress.entity';
import { AchievementProgressStatus } from 'src/achievements/enums/achievement-progress-status.enum';
import {
  AchievementCsvJobData,
  AchievementOnChainJobData,
  AchievementProcessorList,
  AchievementQueueList,
} from 'src/types/achievement';
import { Repository } from 'typeorm';
import { AchievementsOnChainService } from '../../services/achievements-onchain.service';
import { Cache } from 'cache-manager';

@Processor(AchievementProcessorList.HandleOnChain)
export class AchievementsOnChainConsumer {
  private readonly logger = new Logger(AchievementsOnChainConsumer.name);
  private csvWriter: CsvWriter<ObjectMap<any>> = null;
  private cacheKey = 'get-achievements-from-csv';

  constructor(
    @InjectRepository(AchievementProgress)
    private readonly achievementProgressRepository: Repository<AchievementProgress>,
    @Inject(AchievementsOnChainService.name)
    private readonly achievementsOnChainService: AchievementsOnChainService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Process({ name: AchievementQueueList.HandleOnChain, concurrency: 100 })
  async handleOnChainAchievements(
    job: Job<AchievementOnChainJobData>,
  ): Promise<void> {
    const { gameIds, userId } = job?.data;

    await Promise.all(
      gameIds.map((gameId) =>
        this.achievementsOnChainService.handleAchievements(gameId, userId),
      ),
    ).catch((err) => {
      this.logger.error(new Error(err));

      throw err;
    });

    return;
  }

  @OnQueueCompleted({ name: AchievementQueueList.HandleOnChain })
  async onAchievementsJobCompleted(job: Job<AchievementOnChainJobData>) {
    const { userId, current, total } = job?.data;

    if (total === current + 1) {
      const progress = await this.achievementProgressRepository.findOne({
        userId,
      });

      await this.achievementProgressRepository.save({
        ...progress,
        finishedAt: new Date(),
        status: AchievementProgressStatus.COMPLETED,
      });

      this.logger.log('Handler of on chain achievements completed.');
    }
  }

  @OnQueueFailed({ name: AchievementQueueList.HandleOnChain })
  async onAchievementsJobFailed(job: Job<AchievementOnChainJobData>) {
    const { userId } = job?.data;

    const progress = await this.achievementProgressRepository.findOne({
      userId,
    });

    await this.achievementProgressRepository.save({
      ...progress,
      finishedAt: new Date(),
      status: AchievementProgressStatus.FAILED,
    });

    this.logger.error(
      `Handler of on chain achievements failed. ${JSON.stringify(job?.data)}`,
    );
  }

  @Process({ name: AchievementQueueList.HandleCsv, concurrency: 100 })
  async handleCsvAchievements(job: Job<AchievementCsvJobData>): Promise<void> {
    try {
      const { user, games, current } = job?.data;

      if (current === 0) {
        this.cacheManager.set(this.cacheKey, 'in progress');
        const header = [
          { id: 'wallet', title: 'Wallet address' },
          { id: 'achievements', title: 'Achievements' },
        ];

        const path = `./upload/users-achievements-table.csv`;

        this.csvWriter = createObjectCsvWriter({
          path,
          header,
        });
      }

      const record = { wallet: user.walletAddress, achievements: [] };

      await Promise.all(
        games.map((game) =>
          Promise.all(
            game.achievements.map((achievement) =>
              this.achievementsOnChainService
                .handleAchievementRules(game.id, achievement, user, false)
                .then((res) => {
                  if (res) {
                    record.achievements.push(achievement.name);
                  }
                })
                .catch((err) => {
                  this.logger.error(err.message, err.stack);
                  record[`game-${game.id}-${achievement.id}`] = false;
                }),
            ),
          ),
        ),
      );

      if (record.achievements.length) {
        await this.csvWriter.writeRecords([record]);
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @OnQueueActive({ name: AchievementQueueList.HandleCsv })
  async handleOnActive(job: Job<AchievementCsvJobData>) {
    const { user } = job?.data;

    this.logger.verbose(`Add job ${job.id} for user: ${user.walletAddress}`);
  }

  @OnQueueCompleted({ name: AchievementQueueList.HandleCsv })
  async handleOnCompleteScv(job: Job<AchievementCsvJobData>) {
    const { user, total, current } = job.data;

    this.logger.verbose(
      `Complete job ${job.id} for user: ${user.walletAddress}`,
    );

    if (total === current + 1) {
      this.cacheManager.set(this.cacheKey, 'finished');
    }
  }

  @OnQueueFailed({ name: AchievementQueueList.HandleCsv })
  async handleOnFailScv(job: Job<AchievementCsvJobData>) {
    const { user, total, current } = job.data;

    this.logger.verbose(`Fail job ${job.id} for user: ${user.walletAddress}`);

    if (total === current + 1) {
      this.cacheManager.set(this.cacheKey, 'failed');
    }
  }
}
