import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { In, LessThan, Repository } from 'typeorm';
import { SocialStatsExtendedDto } from '../dto/social-stats-extended.dto';
import { SocialStatsDto } from '../dto/social-stats.dto';
import {
  SocialChannel,
  SocialServiceList,
} from '../entities/social-channel.entity';
import { SocialStats } from '../entities/social-stats.entity';
import { BaseSocialAbstract } from './base-social-abstract.service';
import {
  SocialCacheKeyList,
  SocialProcessorList,
  SocialQueueList,
  TwitterPublicMetrics,
  TwitterTweetInfo,
  TwitterUserInfoMetrics,
} from '../../types';
import { Helpers } from 'src/helpers';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export const SERVICE_SOCIAL_TWITTER = 'SERVICE_SOCIAL_TWITTER';

export type GetSocialStatsListPayload = {
  service: SocialServiceList;
  take: number;
};

@Injectable()
export class SocialTwitterService extends BaseSocialAbstract {
  private readonly logger = new Logger(SocialTwitterService.name);

  private readonly twitterApiHost = 'https://api.twitter.com';

  private twitterToken: string;

  private twitterApiKey: string;

  private twitterApiKeySecret: string;

  constructor(
    @InjectRepository(SocialStats)
    private readonly socialStatsRepository: Repository<SocialStats>,
    @InjectRepository(SocialChannel)
    private readonly socialChannelRepository: Repository<SocialChannel>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectQueue(SocialProcessorList.TWITTER)
    private readonly twitterQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();

    const {
      twitter: { bearerToken, apiKey, apiKeySecret },
    } = this.configService.get('socials');

    this.twitterToken = `Bearer ${bearerToken}`;

    this.twitterApiKey = apiKey;

    this.twitterApiKeySecret = apiKeySecret;
  }

  clearAggregationProcessingCache() {
    return this.cacheManager.del(
      SocialCacheKeyList.TwitterAggregationProcessing,
    );
  }

  async aggregationStop(): Promise<string> {
    const jobs = await this.twitterQueue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
      'failed',
      'paused',
    ]);

    return Promise.allSettled(jobs.map((j) => j.remove())).then(
      () => 'Twitter aggregation stopped',
      (err: Error) => {
        this.logger.error(err);

        throw err;
      },
    );
  }

  async fetchUserMetricList(channels: string): Promise<TwitterPublicMetrics[]> {
    const fetchURL = `${this.twitterApiHost}/2/users/by?usernames=${channels}&user.fields=public_metrics`;

    const resp = await firstValueFrom(
      this.httpService.get<TwitterUserInfoMetrics>(fetchURL, {
        headers: { Authorization: this.twitterToken },
      }),
    ).catch((err) => {
      this.logger.error(err);

      throw err;
    });

    if (resp.status !== 200) {
      throw new Error('Response status is failed.');
    }

    const {
      data: { data: metrics },
    } = resp;

    return metrics;
  }

  async fetchTweetMetrics(twitterUserId: string): Promise<TwitterTweetInfo> {
    const [startTime, endTime] = [new Date(), new Date()];
    startTime.setDate(startTime.getDate() - 7);

    const fetchURL = `${
      this.twitterApiHost
    }/2/users/${twitterUserId}/tweets?tweet.fields=public_metrics&start_time=${startTime.toISOString()}&end_time=${endTime.toISOString()}`;

    const resp = await firstValueFrom(
      this.httpService.get<TwitterTweetInfo>(fetchURL, {
        headers: { Authorization: this.twitterToken },
      }),
    ).catch((err) => {
      this.logger.error(err.response.data.errors);

      throw err;
    });

    if (resp.status !== 200) {
      throw new Error('Response status is failed.');
    }

    const { data: tweetInfo } = resp;

    tweetInfo.twitterUserId = twitterUserId;

    return tweetInfo;
  }

  async saveSocialStats(socialStatsList: SocialStatsDto[]): Promise<void> {
    await this.socialStatsRepository
      .upsert(socialStatsList, ['game_id', 'channel_id', 'date'])
      .catch((err: Error) => {
        this.logger.error(new Error(err.message));

        throw err;
      });
  }

  async aggregateStats(): Promise<void> {
    const isAggregationProcessing = !!(await this.cacheManager.get(
      SocialCacheKeyList.TwitterAggregationProcessing,
    ));

    if (isAggregationProcessing) {
      this.logger.warn('Aggregation in processing.');
      return;
    }

    const socialChannelList = await this.socialChannelRepository.find({
      where: { service: SocialServiceList.TWITTER },
    });

    if (!socialChannelList.length) {
      throw new Error('Social channel list is empty.');
    }

    // link to twitter name
    // Example: https://twitter.com/username => username
    const channelList = socialChannelList
      .filter(({ channel }) => channel)
      .map(({ channel, game_id, id: channel_id }) => ({
        game_id,
        channel_id,
        username: Helpers.buildCorrectTwitterChannel(
          channel.split('/')[3].split('?')[0],
        ),
      }));

    const channelMatrix = Helpers.arrayToMatrix(channelList, 1);

    // Create the flag which describe the aggregation in processing.
    // Should be prevented to multiple processes.
    await this.cacheManager.set(
      SocialCacheKeyList.TwitterAggregationProcessing,
      true,
    );

    await Promise.all(
      channelMatrix.map((list, index) =>
        this.twitterQueue.add(
          SocialQueueList.AggregateTwitter,
          {
            list,
            current: index,
            total: channelMatrix.length,
          },
          {
            delay: 3000 * (index + 1),
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
      where: { game_id: gameId, service: SocialServiceList.TWITTER },
    });

    if (!socialChannel) {
      throw new BadRequestException(
        `Can not find twitter channel for gameId: ${gameId}`,
      );
    }

    const [startTime, endTime] = [new Date(), new Date()];
    startTime.setDate(startTime.getDate() - 1);
    endTime.setDate(endTime.getDate() - 2);

    const [today, yesterday] = await this.socialStatsRepository.find({
      where: {
        game_id: gameId,
        channel_id: socialChannel.id,
        date: In([
          startTime.toISOString().slice(0, 10),
          endTime.toISOString().slice(0, 10),
        ]),
      },
      order: { date: 'DESC' },
    });

    if (!today || !yesterday) {
      return new SocialStatsExtendedDto({
        ...(today && today),
        ...(yesterday && yesterday),
        likes_growth: today?.likes_count || yesterday?.likes_count,
        likes_growth_percentage: 1.0,
        members_growth: today?.members_count || yesterday?.members_count,
        members_growth_percentage: 1.0,
        posts_growth: today?.posts_count || yesterday?.posts_count,
        posts_growth_percentage: 1.0,
        reposts_growth: today?.reposts_count || yesterday?.reposts_count,
        reposts_growth_percentage: 1.0,
        comments_growth: today?.comments_count || yesterday?.comments_count,
        comments_growth_percentage: 1.0,
        members_online_count: 0,
        members_online_growth: 0,
        members_online_growth_percentage: 0,
      });
    }

    const stats = plainToInstance(
      SocialStatsExtendedDto,
      {
        ...(yesterday && yesterday),
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

  async getStatsList(
    gameId: number,
    payload: GetSocialStatsListPayload,
  ): Promise<SocialStatsDto[]> {
    const { take } = payload;

    const socialChannel = await this.socialChannelRepository.findOne({
      where: { game_id: gameId, service: SocialServiceList.TWITTER },
    });

    if (!socialChannel) {
      throw new Error(`Can not find twitter channel for gameId: ${gameId}`);
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

  async getLink(gameId: number): Promise<string> {
    const socialChannel = await this.socialChannelRepository.findOne({
      where: { game_id: gameId, service: SocialServiceList.TWITTER },
    });

    if (!socialChannel) {
      throw new NotFoundException(
        `Can not find twitter channel for game id: ${gameId}`,
      );
    }

    return socialChannel.channel;
  }
}
