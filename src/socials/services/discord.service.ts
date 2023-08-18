import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { Between, LessThan, Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import {
  DiscordInviteResponse,
  SocialCacheKeyList,
  SocialProcessorList,
  SocialQueueList,
} from 'src/types';
import { SocialStatsExtendedDto } from '../dto/social-stats-extended.dto';
import { SocialStatsDto } from '../dto/social-stats.dto';
import {
  SocialChannel,
  SocialServiceList,
} from '../entities/social-channel.entity';
import { SocialStats } from '../entities/social-stats.entity';
import { BaseSocialAbstract } from './base-social-abstract.service';
import { GetSocialStatsListPayload } from './twitter.service';

export const SERVICE_SOCIAL_DISCORD = 'SERVICE_SOCIAL_DISCORD';

@Injectable()
export class SocialDiscordService extends BaseSocialAbstract {
  private readonly logger = new Logger(SocialDiscordService.name);

  constructor(
    @InjectRepository(SocialStats)
    private readonly socialStatsRepository: Repository<SocialStats>,
    @InjectRepository(SocialChannel)
    private readonly socialChannelRepository: Repository<SocialChannel>,
    private readonly httpService: HttpService,
    @InjectQueue(SocialProcessorList.DISCORD)
    private readonly discordQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  clearAggregationProcessingCache() {
    return this.cacheManager.del(
      SocialCacheKeyList.DiscordAggregationProcessing,
    );
  }

  async fetchChannelInfo(
    channel: SocialChannel['channel'],
  ): Promise<DiscordInviteResponse> {
    const resp = await firstValueFrom(
      this.httpService.get<DiscordInviteResponse>(channel),
    ).catch((err) => {
      this.logger.error(
        new Error(`Can not fetch discord channel info: ${channel}`),
      );

      throw err;
    });

    if (resp.status !== 200) {
      throw new InternalServerErrorException(`Can not get ${channel}`);
    }

    resp.data.channel = channel;

    return resp.data;
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

  async aggregationStop(): Promise<string> {
    const jobs = await this.discordQueue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
      'failed',
      'paused',
    ]);

    return Promise.allSettled(jobs.map((j) => j.remove())).then(
      () => 'Discord aggregation stopped',
      (err: Error) => {
        this.logger.error(err);

        throw err;
      },
    );
  }

  async saveSocialStats(socialStats: SocialStatsDto): Promise<void> {
    await this.socialStatsRepository
      .upsert(socialStats, ['game_id', 'channel_id', 'date'])
      .catch((err: Error) => {
        this.logger.error(new Error(err.message));

        throw err;
      });
  }

  async aggregateStats(): Promise<void> {
    const isAggregationProcessing = !!(await this.cacheManager.get(
      SocialCacheKeyList.DiscordAggregationProcessing,
    ));

    if (isAggregationProcessing) {
      this.logger.warn('Aggregation in processing.');
      return;
    }

    const socialChannelList = await this.socialChannelRepository.find({
      where: { service: SocialServiceList.DISCORD },
    });

    if (!socialChannelList.length) {
      throw new InternalServerErrorException('Social channel list is empty.');
    }

    const channelList = socialChannelList
      .map(({ channel, game_id, id: channel_id }) => ({
        channel: channel.split('https://discord.com/invite/').length
          ? channel.split('https://discord.com/invite/')[1]
          : null,
        game_id,
        channel_id,
      }))
      .filter(({ channel }) => !!channel);

    const channelLinkList = channelList.map(({ channel, ...rest }) => ({
      link: `https://discord.com/api/v9/invites/${channel.trim()}?with_counts=true&with_expiration=true`,
      ...rest,
    }));

    // Create the flag which describe the aggregation in processing.
    // Should be prevented to multiple processes.
    await this.cacheManager.set(
      SocialCacheKeyList.DiscordAggregationProcessing,
      true,
    );

    await Promise.all(
      channelLinkList.map((channel, current) =>
        this.discordQueue.add(
          SocialQueueList.AggregateDiscord,
          {
            ...channel,
            total: channelLinkList.length,
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
      where: { game_id: gameId, service: SocialServiceList.DISCORD },
    });

    if (!socialChannel) {
      throw new NotFoundException(
        `Can not find discord channel for gameId: ${gameId}`,
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
        `Can not find social stats list for discord by game id: ${gameId}.`,
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
      where: { game_id: gameId, service: SocialServiceList.DISCORD },
    });

    if (!socialChannel) {
      throw new NotFoundException(
        `Can not find discord channel for gameId: ${gameId}`,
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
