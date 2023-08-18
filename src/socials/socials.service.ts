import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { SocialCacheKeyList } from 'src/types';
import { Repository } from 'typeorm';
import { AddSocialChannelDto } from './dto/add-social-channel.dto';
import { SocialStatsExtendedDto } from './dto/social-stats-extended.dto';
import { SocialStatsDto } from './dto/social-stats.dto';
import { SocialStatsAggregateAllResponseDto } from './dto/SocialStatsAggregateAllResponse.dto';
import {
  SocialChannel,
  SocialServiceList,
} from './entities/social-channel.entity';
import { SocialStats } from './entities/social-stats.entity';
import { ISocialService } from './interfaces/social-service.interface';
import { SERVICE_SOCIAL_DISCORD } from './services/discord.service';
import { SERVICE_SOCIAL_TELEGRAM } from './services/telegram.service';
import {
  GetSocialStatsListPayload,
  SERVICE_SOCIAL_TWITTER,
} from './services/twitter.service';
import { SERVICE_SOCIAL_UNKNOWN } from './services/unknown.service';

@Injectable()
export class SocialsService {
  private readonly logger = new Logger(SocialsService.name);

  constructor(
    @InjectRepository(SocialStats)
    private readonly socialStatsRepository: Repository<SocialStats>,
    @InjectRepository(SocialChannel)
    private readonly socialChannelRepository: Repository<SocialChannel>,
    @Inject(SERVICE_SOCIAL_TWITTER)
    private readonly twitterService: ISocialService,
    @Inject(SERVICE_SOCIAL_DISCORD)
    private readonly discordService: ISocialService,
    @Inject(SERVICE_SOCIAL_TELEGRAM)
    private readonly telegramService: ISocialService,
    @Inject(SERVICE_SOCIAL_UNKNOWN)
    private readonly unknownService: ISocialService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async aggregationStop(services: SocialServiceList[] = []) {
    const selectedServices = services.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: !!Object.values(SocialServiceList).find((i) => i === curr),
      }),
      { TWITTER: false, TELEGRAM: false, DISCORD: false },
    );

    await Promise.allSettled([
      this.discordService.clearAggregationProcessingCache(),
      this.telegramService.clearAggregationProcessingCache(),
      this.twitterService.clearAggregationProcessingCache(),
    ]).catch((err: Error) => {
      this.logger.error(err);

      throw err;
    });

    return Promise.allSettled([
      new Promise<string>((resolve) => {
        if (!selectedServices.TWITTER) return resolve('Ignored.');

        this.twitterService.aggregationStop().then(
          (msg: string) => resolve(msg),
          (err: Error) => resolve(err.message),
        );
      }),
      new Promise<string>((resolve) => {
        if (!selectedServices.DISCORD) return resolve('Ignored.');

        this.discordService.aggregationStop().then(
          (msg: string) => resolve(msg),
          (err: Error) => resolve(err.message),
        );
      }),
      new Promise<string>((resolve) => {
        if (!selectedServices.TELEGRAM) return resolve('Ignored.');

        this.telegramService.aggregationStop().then(
          (msg: string) => resolve(msg),
          (err: Error) => resolve(err.message),
        );
      }),
    ]);
  }

  async aggregateAll(services: SocialServiceList[] = []) {
    const selectedServices = services.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: !!Object.values(SocialServiceList).find((i) => i === curr),
      }),
      { TWITTER: false, TELEGRAM: false, DISCORD: false },
    );

    // @todo: Weak implementation, can be missed the error.
    const [twitterProcessing, discordProcessing, telegramProcessing] =
      await Promise.all([
        this.cacheManager
          .get(SocialCacheKeyList.TwitterAggregationProcessing)
          .then(Boolean, () => false),
        this.cacheManager
          .get(SocialCacheKeyList.DiscordAggregationProcessing)
          .then(Boolean, () => false),
        this.cacheManager
          .get(SocialCacheKeyList.TelegramAggregationProcessing)
          .then(Boolean, () => false),
      ]);

    const [twitter, discord, telegram] = await Promise.all([
      new Promise<string>((resolve) => {
        if (twitterProcessing) return resolve('In processing.');
        if (!selectedServices.TWITTER) return resolve('Ignored.');

        this.twitterService.aggregateStats().then(
          () => resolve('Aggregation initiate'),
          (err: Error) => resolve(err.message),
        );
      }),
      new Promise<string>((resolve) => {
        if (discordProcessing) return resolve('In processing.');
        if (!selectedServices.DISCORD) return resolve('Ignored.');

        this.discordService.aggregateStats().then(
          () => resolve('Aggregation initiate'),
          (err: Error) => resolve(err.message),
        );
      }),
      new Promise<string>((resolve) => {
        if (telegramProcessing) return resolve('In processing.');
        if (!selectedServices.TELEGRAM) return resolve('Ignored.');

        this.telegramService.aggregateStats().then(
          () => resolve('Aggregation initiate'),
          (err: Error) => resolve(err.message),
        );
      }),
    ]);

    return new SocialStatsAggregateAllResponseDto({
      twitter,
      discord,
      telegram,
    });
  }

  mapTwitterStats(socialStats: SocialStats[]): SocialStatsExtendedDto {
    if (!socialStats || !socialStats?.length) {
      return null;
    }

    const [yesterday, today] = socialStats;

    if (!today || !yesterday) {
      return new SocialStatsExtendedDto({
        ...(today && today),
        ...(yesterday && yesterday),
        likes_growth: today?.likes_count || yesterday?.likes_count,
        likes_growth_percentage: 0,
        members_growth: today?.members_count || yesterday?.members_count,
        members_growth_percentage: 0,
        posts_growth: today?.posts_count || yesterday?.posts_count,
        posts_growth_percentage: 0,
        reposts_growth: today?.reposts_count || yesterday?.reposts_count,
        reposts_growth_percentage: 0,
        comments_growth: today?.comments_count || yesterday?.comments_count,
        comments_growth_percentage: 0,
        members_online_count: 0,
        members_online_growth: 0,
        members_online_growth_percentage: 0,
      });
    }

    const stats = plainToInstance(
      SocialStatsExtendedDto,
      {
        ...(yesterday && { yesterday }),
        ...today,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    // Likes growths.
    stats.likes_growth = yesterday
      ? today.likes_count - yesterday.likes_count
      : today.likes_count;

    stats.likes_growth_percentage = Number(
      Number(
        yesterday
          ? (today.likes_count - yesterday.likes_count) / yesterday.likes_count
          : 1.0,
      ),
    );

    // Followers growths.
    stats.members_growth = yesterday
      ? today.members_count - yesterday.members_count
      : today.members_count;

    stats.members_growth_percentage = Number(
      Number(
        yesterday
          ? (today.members_count - yesterday.members_count) /
              yesterday.members_count
          : 1.0,
      ),
    );

    // Tweets growths.
    stats.posts_growth = yesterday
      ? today.posts_count - yesterday.posts_count
      : today.posts_count;

    stats.posts_growth_percentage = Number(
      Number(
        yesterday
          ? (today.posts_count - yesterday.posts_count) / yesterday.posts_count
          : 1.0,
      ),
    );

    // Re tweets growths.
    stats.reposts_growth = yesterday
      ? today.reposts_count - yesterday.reposts_count
      : today.reposts_count;

    stats.reposts_growth_percentage = Number(
      Number(
        yesterday
          ? (today.reposts_count - yesterday.reposts_count) /
              yesterday.reposts_count
          : 1.0,
      ),
    );

    // Comments growths.
    stats.comments_growth = yesterday
      ? today.comments_count - yesterday.comments_count
      : today.comments_count;

    stats.comments_growth_percentage = Number(
      Number(
        yesterday
          ? (today.comments_count - yesterday.comments_count) /
              yesterday.comments_count
          : 1.0,
      ),
    );

    stats.members_online_count = 0;
    stats.members_online_growth = 0;
    stats.members_online_growth_percentage = 0;

    return stats;
  }

  mapDiscordStats(socialStatsList: SocialStats[]): SocialStatsExtendedDto {
    if (!socialStatsList || !socialStatsList.length) {
      return null;
    }

    const [yesterday, today] = socialStatsList;

    if (!yesterday || !today) {
      return new SocialStatsExtendedDto({
        ...(yesterday && yesterday),
        ...(today && today),
        members_growth: today?.members_count || yesterday?.members_count,
        members_growth_percentage: 0,
        members_online_growth:
          today?.members_online_count || yesterday?.members_online_count,
        members_online_growth_percentage: 0,
        likes_growth: 0,
        likes_growth_percentage: 0,
        posts_growth: 0,
        posts_growth_percentage: 0,
        reposts_growth: 0,
        reposts_growth_percentage: 0,
        comments_growth: 0,
        comments_growth_percentage: 0,
      });
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

    const socialStatsExtended = new SocialStatsExtendedDto({
      ...startRecord,
      likes_growth: 0,
      likes_growth_percentage: 0,
      posts_growth: 0,
      posts_growth_percentage: 0,
      reposts_growth: 0,
      reposts_growth_percentage: 0,
      comments_growth: 0,
      comments_growth_percentage: 0,
    });

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

    return socialStatsExtended;
  }

  async getSocialStats(
    gameId: number,
    serviceName: SocialServiceList,
  ): Promise<SocialStatsExtendedDto> {
    const socialService = this.getSocialService(serviceName);

    const stats = await socialService.getStats(gameId);

    return stats;
  }

  async getSocialStatsList(
    gameId: number,
    payload: GetSocialStatsListPayload,
  ): Promise<SocialStatsDto[]> {
    const socialService = this.getSocialService(payload.service);

    const statsList = await socialService.getStatsList(gameId, payload);

    return statsList;
  }

  async getSocialLinkList(gameId: number): Promise<SocialChannel[]> {
    try {
      const links = await this.socialChannelRepository.find({
        where: { game_id: gameId },
      });

      if (!links.length) {
        return [];
      }

      return links;
    } catch (error) {}
  }

  async getSocialLink(
    gameId: number,
    serviceName: SocialServiceList,
  ): Promise<string> {
    const socialService = this.getSocialService(serviceName);

    return socialService.getLink(gameId);
  }

  async createSocialChannel(
    gameId: number,
    addSocialChannelDto: AddSocialChannelDto,
  ): Promise<SocialChannel> {
    try {
      const data = this.socialChannelRepository.create({
        game_id: gameId,
        ...addSocialChannelDto,
      });

      const channel = await this.socialChannelRepository.save(data);

      return channel;
    } catch (error) {
      throw new BadRequestException('Error creating social channel');
    }
  }

  async deleteSocialChannel(id: number): Promise<void> {
    try {
      await this.socialChannelRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private getSocialService(serviceName: SocialServiceList): ISocialService {
    switch (serviceName) {
      case SocialServiceList.TWITTER:
        return this.twitterService;
      case SocialServiceList.DISCORD:
        return this.discordService;
      case SocialServiceList.TELEGRAM:
        return this.telegramService;
      default:
        return this.unknownService;
    }
  }
}
