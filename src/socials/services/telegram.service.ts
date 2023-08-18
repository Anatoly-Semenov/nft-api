import { InjectQueue } from '@nestjs/bull';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import {
  SocialCacheKeyList,
  SocialProcessorList,
  SocialQueueList,
} from 'src/types';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Between, LessThan, Repository } from 'typeorm';
import { SocialChannelDto } from '../dto/social-channel.dto';
import { SocialStatsExtendedDto } from '../dto/social-stats-extended.dto';
import { SocialStatsDto } from '../dto/social-stats.dto';
import {
  SocialChannel,
  SocialServiceList,
} from '../entities/social-channel.entity';
import { SocialSession } from '../entities/social-session.entity';
import { SocialStats } from '../entities/social-stats.entity';
import { BaseSocialAbstract } from './base-social-abstract.service';
import { GetSocialStatsListPayload } from './twitter.service';

export const SERVICE_SOCIAL_TELEGRAM = 'SERVICE_SOCIAL_TELEGRAM';

@Injectable()
export class SocialTelegramService extends BaseSocialAbstract {
  private readonly logger = new Logger(SocialTelegramService.name);

  private apiId: number;

  private apiHash: string;

  private session: string;

  private client: TelegramClient;

  constructor(
    @InjectRepository(SocialSession)
    private readonly socialSessionRepository: Repository<SocialSession>,
    @InjectRepository(SocialChannel)
    private readonly socialChannelRepository: Repository<SocialChannel>,
    @InjectRepository(SocialStats)
    private readonly socialStatsRepository: Repository<SocialStats>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectQueue(SocialProcessorList.TELEGRAM)
    private readonly telegramQueue: Queue,
  ) {
    super();

    const {
      telegram: { apiId = -1, apiHash = '', session = '' },
    } = this.configService.get('socials');

    this.apiId = apiId;

    this.apiHash = apiHash;

    this.session = session;
  }

  private async getClient(): Promise<TelegramClient> {
    if (this.client) {
      return this.client;
    }

    const record = await this.socialSessionRepository.findOne({
      where: { service: SocialServiceList.TELEGRAM },
    });

    const stringSession = new StringSession(record?.session || '');

    this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });

    await this.client
      .start({
        phoneNumber: async () =>
          await new Promise<string>(() => {
            throw new Error(
              'You should create telegram client session before.',
            );
          }),
        phoneCode: async () =>
          await new Promise<string>(() => {
            throw new Error(
              'You should create telegram client session before.',
            );
          }),
        onError: (err: Error) => this.logger.error(err),
      })
      .catch((err: Error) => {
        this.logger.error(err);

        throw err;
      });

    const currentSession = this.client.session.save() as unknown as string;

    await this.socialSessionRepository.upsert(
      {
        service: SocialServiceList.TELEGRAM,
        session: currentSession,
      },
      ['service'],
    );

    return this.client;
  }

  async getChannelInfo(
    channel: SocialChannelDto['channel'],
  ): Promise<Api.messages.ChatFull> {
    const client = await this.getClient();

    await client.invoke(
      new Api.channels.JoinChannel({
        channel,
      }),
    );

    const result = await client.invoke(
      new Api.channels.GetFullChannel({
        channel,
      }),
    );

    return result;
  }

  async aggregationStop(): Promise<string> {
    const jobs = await this.telegramQueue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
      'failed',
      'paused',
    ]);

    return Promise.allSettled(jobs.map((j) => j.remove())).then(
      () => 'Telegram aggregation stopped',
      (err: Error) => {
        this.logger.error(err);

        throw err;
      },
    );
  }

  async isAggregationExists(
    gameId: SocialStats['game_id'],
    channelId: SocialStats['channel_id'],
  ): Promise<boolean> {
    const [sixHours, justNow] = [new Date(), new Date()];
    sixHours.setHours(sixHours.getHours() - 6);

    const socialStats = await this.socialStatsRepository.findOne({
      select: ['id'],
      where: {
        game_id: gameId,
        channel_id: channelId,
        date: Between(sixHours, justNow),
      },
      order: {
        date: 'DESC',
      },
    });

    return !!socialStats;
  }

  async saveSocialStats(socialStats: SocialStatsDto): Promise<void> {
    await this.socialStatsRepository
      .upsert(socialStats, ['game_id', 'channel_id', 'date'])
      .catch((err: Error) => {
        this.logger.error(new Error(err.message));

        throw err;
      });
  }

  clearAggregationProcessingCache() {
    return this.cacheManager.del(
      SocialCacheKeyList.TelegramAggregationProcessing,
    );
  }

  async aggregateStats(): Promise<void> {
    const isAggregationProcessing = !!(await this.cacheManager.get(
      SocialCacheKeyList.TelegramAggregationProcessing,
    ));

    if (isAggregationProcessing) {
      this.logger.warn('Aggregation in processing.');
      return;
    }

    const socialChannelList = await this.socialChannelRepository.find({
      where: { service: SocialServiceList.TELEGRAM },
    });

    if (!socialChannelList.length) {
      throw new Error('Can not found channel for telegram.');
    }

    const channelList = socialChannelList
      .filter(({ channel }) => channel.includes('https://t.me/'))
      .map(({ channel, id: channel_id, game_id }) => ({
        username: channel.split('https://t.me/')[1].trim(),
        channel_id,
        game_id,
      }));

    // Create the flag which describe the aggregation in processing.
    // Should be prevented to multiple processes.
    await this.cacheManager.set(
      SocialCacheKeyList.TelegramAggregationProcessing,
      true,
    );

    await Promise.all(
      channelList.map((channel, current) =>
        this.telegramQueue.add(
          SocialQueueList.AggregateTelegram,
          {
            ...channel,
            total: channelList.length,
            current,
          },
          {
            delay: 3000 * (current + 1),
            attempts: 1,
            removeOnFail: true,
            removeOnComplete: true,
          },
        ),
      ),
    );
  }

  async getStats(gameId: number): Promise<SocialStatsExtendedDto> {
    const socialChannel = await this.socialChannelRepository.findOne({
      where: { game_id: gameId, service: SocialServiceList.TELEGRAM },
    });

    if (!socialChannel) {
      throw new NotFoundException(
        `Can not find telegram channel for gameId: ${gameId}`,
      );
    }

    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1);

    const socialStatsList = await this.socialStatsRepository.find({
      where: {
        game_id: gameId,
        channel_id: socialChannel.id,
        date: LessThan(startTime),
      },
      order: { date: 'DESC' },
      take: 8,
    });

    if (!socialStatsList.length) {
      throw new NotFoundException(
        'Can not find social stats list for telegram.',
      );
    }

    // Обработка кейса в котором есть только одна запись со статистикой.
    if (socialStatsList.length === 1) {
      const [socialStats] = socialStatsList;

      const socialStatsExtended = plainToInstance(
        SocialStatsExtendedDto,
        socialStats,
        { excludeExtraneousValues: true },
      );

      socialStatsExtended.members_growth = socialStats.members_count;
      socialStatsExtended.members_growth_percentage = 1.0;
      socialStatsExtended.members_online_growth =
        socialStats.members_online_count;
      socialStatsExtended.members_online_growth_percentage = 1.0;

      socialStatsExtended.likes_growth = 0;
      socialStatsExtended.likes_growth_percentage = 0;
      socialStatsExtended.posts_growth = 0;
      socialStatsExtended.posts_growth_percentage = 0;
      socialStatsExtended.reposts_growth = 0;
      socialStatsExtended.reposts_growth_percentage = 0;
      socialStatsExtended.comments_growth = 0;
      socialStatsExtended.comments_growth_percentage = 0;

      return socialStatsExtended;
    }

    const [startRecord, endRecord] = [
      socialStatsList[0],
      socialStatsList[socialStatsList.length - 1],
    ];

    // Определяем середину слепка данных по дням.
    // Для того чтобы вычислить рост между двумя днями.
    const middleOfRow = Math.round((socialStatsList.length - 1) / 2);

    // Определяем условный срез по первому дню и второму дню.
    // Учитываем что срез может быть не кратен 4м (количество рекордов в день)
    // Учесть кейс что в день 4 рекорда со статой.
    const [firstSlicedDay, secondSlicedDay] =
      socialStatsList.length / 4 === 2
        ? [socialStatsList.slice(0, 4), socialStatsList.slice(4)]
        : [
            socialStatsList.slice(0, middleOfRow),
            socialStatsList.slice(middleOfRow),
          ];

    // Определение среднего значения по-первому условному срезу.
    const firstDayMedianMembersOnlineCount = firstSlicedDay.reduce(
      (acc, curr) =>
        acc === 0
          ? curr.members_online_count
          : (acc + curr.members_online_count) / 2,
      0,
    );

    // Определение среднего значения по-второму условному срезу.
    const secondDayMedianMembersOnlineCount = secondSlicedDay.reduce(
      (acc, curr) =>
        acc === 0
          ? curr.members_online_count
          : (acc + curr.members_online_count) / 2,
      0,
    );

    const socialStatsExtended = plainToInstance(
      SocialStatsExtendedDto,
      startRecord,
      { excludeExtraneousValues: true },
    );

    // Members online growths.
    socialStatsExtended.members_online_count =
      (firstDayMedianMembersOnlineCount + secondDayMedianMembersOnlineCount) /
      2;

    socialStatsExtended.members_online_growth =
      firstDayMedianMembersOnlineCount - secondDayMedianMembersOnlineCount;

    socialStatsExtended.members_online_growth_percentage = Number(
      Number(
        (firstDayMedianMembersOnlineCount - secondDayMedianMembersOnlineCount) /
          secondDayMedianMembersOnlineCount,
      ),
    );

    // Members growths.
    socialStatsExtended.members_growth = endRecord
      ? startRecord.members_count - endRecord.members_count
      : startRecord.members_count;

    // Members growths in percentage.
    socialStatsExtended.members_growth_percentage = Number(
      Number(
        endRecord
          ? (startRecord.members_count - endRecord.members_count) /
              endRecord.members_count
          : 1.0,
      ),
    );

    socialStatsExtended.likes_growth = 0;
    socialStatsExtended.likes_growth_percentage = 0;
    socialStatsExtended.posts_growth = 0;
    socialStatsExtended.posts_growth_percentage = 0;
    socialStatsExtended.reposts_growth = 0;
    socialStatsExtended.reposts_growth_percentage = 0;
    socialStatsExtended.comments_growth = 0;
    socialStatsExtended.comments_growth_percentage = 0;

    return socialStatsExtended;
  }

  async getStatsList(
    gameId: number,
    payload: GetSocialStatsListPayload,
  ): Promise<SocialStats[]> {
    const { take } = payload;

    const socialChannel = await this.socialChannelRepository.findOne({
      where: { game_id: gameId, service: SocialServiceList.TELEGRAM },
    });

    if (!socialChannel) {
      throw new NotFoundException(
        `Can not find telegram channel for gameId: ${gameId}`,
      );
    }

    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1);

    const socialStatsList = await this.socialStatsRepository.find({
      where: {
        game_id: gameId,
        channel_id: socialChannel.id,
        date: LessThan(startTime),
      },
      order: { date: 'DESC' },
      take,
    });

    const statsList = socialStatsList.map((i) =>
      plainToInstance(SocialStatsDto, i, { excludeExtraneousValues: true }),
    );

    return statsList;
  }

  getLink(gameId: number): Promise<string> {
    throw new InternalServerErrorException('Method did not implemented.');
  }
}
