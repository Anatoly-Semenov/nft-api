import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { cloneDeep } from 'lodash';

// Libs
import { Connection, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

// Services
import { AchievementsService } from 'src/achievements/achievements.service';
import { AccountTransferAggregationService } from 'src/chain-parser/services/account-transfer-aggregation.service';
import { GamesService } from 'src/games/games.service';
import { UsersService } from 'src/users/users.service';

// Entity
import { Achievement } from 'src/achievements/entities/achievement.entity';
import { Game } from 'src/games/entities/game.entity';
import { User } from 'src/users/entities/user.entity';
import { ProfileMoralisLogs } from './entities/profile-moralis-logs.entity';
import { UserMintedAchievement } from '../users/entities/user-minted-achievement.entity';

// DTO
import { AchievementDto } from 'src/achievements/dto/achievement.dto';
import { MetaListDto } from 'src/common/dto/meta-list.dto';
import {
  ProfileNftDto,
  ProfileGameDto,
  ProfileGameAchievementDto,
  ProfileGamesDto,
  ProfileMeDto,
  GetProfileGamesDto,
  ProfileStatusDto,
  ProfileAchievementGameDto,
  UserProfileDto,
  LeaderboardDto,
  LeaderboardQueryDto,
  GetMoralisLogsDto,
  MoralisLogsResponseDto,
  MoralisLogsItemDto,
} from './dto';

// Types
import { ProfileMoralisStatus } from './enums/profile-moralis-status.enum';
import { AchievementStatus } from 'src/achievements/enums/achievement-status';
import { LeaderboardSort } from './interfaces';
import { LeaderboardDays } from './types';
import { ListDto } from '../common/dto/list.dto';
import { GameProvider } from 'src/games/enums/game-provider.enum';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

export const PROFILE_LEVEL_DELIMITER = 100;

const MORALIS_SERVER_URL = 'https://deep-index.moralis.io/api/v2';
const MORALIS_API_KEY =
  '3TuQUnvPUjCnOJfi4OKt31EgHgudXzdYEJRXeYDCmofTih6ppb7dc3n7VNHjoddu';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly gamesService: GamesService,
    private readonly usersService: UsersService,
    private readonly achievementsService: AchievementsService,
    private readonly accountTransferAggregationService: AccountTransferAggregationService,
    @InjectRepository(ProfileMoralisLogs)
    private readonly profileMoralisLogsRepository: Repository<ProfileMoralisLogs>,
    private readonly httpService: HttpService,
  ) {}

  private buildAchievementWithStatus(
    { id, ...achievement }: Achievement,
    canClaimAchievements: number[],
    mintedAchievements?: number[],
  ): AchievementDto {
    let status = canClaimAchievements.includes(id)
      ? AchievementStatus.NOT_CLAIMED
      : AchievementStatus.DISABLED;

    if (mintedAchievements && mintedAchievements.length) {
      if (mintedAchievements.includes(id)) {
        status = AchievementStatus.CLAIMED;
      }
    }

    return new AchievementDto({
      id,
      ...achievement,
      status,
    });
  }

  private async getProfileAchievementIds(
    userId: User['id'],
  ): Promise<number[]> {
    const achievements = await this.usersService.getUserAchievements(userId, [
      'achievement',
    ]);

    // Collect the not claimed achievement ids for detect achievement status.
    const achievementIds = achievements.map(({ achievement: { id } }) => id);

    return achievementIds;
  }

  private async getGameUserEarnSpend(
    gameId: Game['id'],
    user: User,
  ): Promise<ProfileGameDto> {
    const { earn, spend } =
      await this.accountTransferAggregationService.getEarnSpend({
        gameId,
        userWalletAddress: user.walletAddress,
      });

    const achievements = await this.getGameAchievements(gameId, user.id);

    const achievementPoints = achievements.reduce(
      (acc, curr) =>
        curr.status === AchievementStatus.NOT_CLAIMED
          ? (acc += curr.scores)
          : acc,
      0,
    );

    const points = earn / 100 - spend / 100 + achievementPoints;

    return new ProfileGameDto({
      stats: { spend, earn, points, roi: (earn - spend) / spend },
      isActive: Boolean(spend && earn),
    });
  }

  private async getGamesUserEarnSpend(
    games: Game[],
    user: User,
  ): Promise<ProfileGameDto[]> {
    const gameIds = games.map(({ id }) => id);

    const [gamesEarnSpendList, profileAchievementIds] = await Promise.all([
      this.accountTransferAggregationService
        .getRawEarnSpend(gameIds, user.walletAddress)
        .then((res) => res.map((el) => ({ ...el, spend: Math.abs(el.spend) }))),
      this.getProfileAchievementIds(user.id),
    ]);

    const profileGames: ProfileGameDto[] = games.map(
      ({ achievements: gameAchievements, ...game }) => {
        const achievements = gameAchievements.map((achievement) =>
          this.buildAchievementWithStatus(achievement, profileAchievementIds),
        );

        const achievementPoints = achievements.reduce(
          (acc, curr) =>
            curr.status === AchievementStatus.NOT_CLAIMED
              ? (acc += curr.scores)
              : acc,
          0,
        );

        const { earn = 0, spend = 0 } =
          gamesEarnSpendList.find((i) => i.gameId === game.id) || {};

        const points = earn / 100 - spend / 100 + achievementPoints;

        return new ProfileGameDto({
          game,
          stats: { spend, earn, points, roi: (earn - spend) / spend },
          isActive: Boolean(spend && earn),
        });
      },
    );

    return profileGames;
  }

  private async prepareLeaderboardData(
    byDay: string,
  ): Promise<LeaderboardDto[]> {
    try {
      // language=PostgreSQL
      const query = `
      SELECT
        DISTINCT "user_id", count(*) as achievement_count
      FROM
        "public"."user_minted_achievement"
      WHERE
        created_at >= '${byDay}'
      GROUP BY
        "user_id"
      ORDER BY
        achievement_count DESC
    `;

      const [response, achievementsCount] = await Promise.all([
        this.connection.query(query),
        this.achievementsService.getAchievementsLength(),
      ]);

      const usersIds: string[] = response.map(({ user_id }) => user_id);

      return await this.prepareLeaderboardList(
        usersIds,
        achievementsCount,
        byDay,
      );
    } catch (error) {
      throw new BadRequestException(error.message, error);
    }
  }

  private async prepareLeaderboardList(
    usersIds: string[],
    achievementsCount: number,
    byDay: string,
  ): Promise<LeaderboardDto[]> {
    try {
      const users = await this.usersService.findByIds(usersIds, [
        'mintedAchievements',
        'mintedAchievements.achievement',
        'mintedAchievements.achievement.game',
        'records',
      ]);

      return usersIds.map((user_id) => {
        const user = users.find((user) => user.id === Number(user_id));

        const games = user.mintedAchievements
          .map((achievement) => achievement?.achievement?.game?.id)
          .filter((id, index, self) => self.indexOf(id) === index);

        // Set byDay filter
        user.mintedAchievements = user.mintedAchievements.filter(
          ({ createdAt }) => {
            return moment(byDay).isBefore(createdAt);
          },
        );

        const points = this.getPointsByAchievements(user.mintedAchievements);

        const balance = user.records.reduce(
          (acc, curr) => curr.amount + acc,
          0,
        );

        return new LeaderboardDto({
          index: 1,
          user_id: Number(user_id),
          avatar: this.usersService.getUserAvatar(user),
          name: user.displayedName,
          wallet: user.walletAddress,
          earned_achievements: user.mintedAchievements.length,
          total_achievements: achievementsCount,
          games: games.length,
          points,
          balance,
        });
      });
    } catch (error) {
      this.logger.error(
        `Failed method 'prepareLeaderboardList()' ${JSON.stringify(error)}`,
      );
    }
  }

  private setLeaderboardSearch(
    data: LeaderboardDto[],
    q: string,
  ): LeaderboardDto[] {
    if (q) {
      data = data.filter(({ wallet, name }) => {
        return (
          wallet.toLowerCase().includes(q?.toLowerCase()) ||
          name?.toLowerCase().includes(q?.toLowerCase())
        );
      });
    }

    return data;
  }

  private setLeaderboardSort(
    sort: LeaderboardSort,
    data: LeaderboardDto[],
  ): LeaderboardDto[] {
    const setSort = (name: keyof LeaderboardSort) => {
      if (sort?.[name]) {
        data.sort((a, b) => {
          if (sort[name] === 'descend') {
            return b[name] - a[name];
          }

          return a[name] - b[name];
        });
      }
    };

    setSort('index');
    setSort('earned_achievements');
    setSort('games');
    setSort('points');

    return data;
  }

  private setLeaderboardPagination(
    page: number,
    limit: number,
    data: LeaderboardDto[],
  ): LeaderboardDto[] {
    if (data.length > limit) {
      let startIndex = page * limit - limit;

      if (page !== 1) {
        startIndex = startIndex - 1;
      }

      data = data.splice(startIndex, limit);
    }

    return data;
  }

  private setMeFirst(
    data: LeaderboardDto[],
    fullData: LeaderboardDto[],
    myUserId: string,
  ): LeaderboardDto[] {
    const my_user_id = Number(myUserId);

    const indexMeFromFullData = fullData.findIndex(({ user_id }) => {
      return user_id === my_user_id;
    });

    if (indexMeFromFullData > -1) {
      const me = fullData[indexMeFromFullData];

      const indexMe = data.findIndex(({ user_id }) => user_id === my_user_id);

      if (indexMe > -1) {
        data.splice(indexMe, 1);
      }

      data.unshift(me);
    }

    if (data.length > 25) {
      data.pop();
    }

    return data;
  }

  private async getMintedAchievements(
    user: User,
  ): Promise<{ status: ProfileMoralisStatus; data: number[] }> {
    const userId = user.id.toString();
    const userProviderIds = Object.keys(GameProvider)
      .map((provider: GameProvider) =>
        this.achievementsService.getUserProviderId(provider, user),
      )
      .filter((provider) => !!provider);

    try {
      const result = await Promise.all(
        userProviderIds.map((provider) =>
          this.getMoralisContractLogs({
            provider,
            limit: 500,
          }),
        ),
      );

      const transactions = result.reduce(
        (acc, res) => [...acc, ...res.result],
        [],
      );

      const data = transactions.map(({ data }) =>
        Number(data.achievementTypeId),
      );
      const status = ProfileMoralisStatus.SUCCESS;

      await Promise.all([
        this.addMoralisLogs(
          status,
          `User ${userId}: Got ${transactions.length} items`,
        ),

        this.usersService.addClaimedNfts(userId, data),
      ]);

      return { status, data };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      const status = ProfileMoralisStatus.FAIL;

      const [user] = await Promise.all([
        this.usersService.findById(userId, [
          'mintedAchievements',
          'mintedAchievements.achievement',
        ]),
        this.addMoralisLogs(status, `User ${userId}: ${error.message}`),
      ]);

      const data = user.mintedAchievements.map(
        ({ achievement }) => achievement.id,
      );

      return { status, data };
    }
  }

  private mapMoralisLogsItem(item: MoralisLogsItemDto): MoralisLogsItemDto {
    const web3 = new Web3();

    const dataTypes = [
      { type: 'address', name: 'holder' },
      { type: 'uint256', name: 'achievementTypeId' },
      { type: 'uint256', name: 'collectionId' },
      { type: 'uint256', name: 'tokenId' },
    ];

    return {
      ...item,
      topic1: web3.eth.abi.decodeParameter('address', item.topic1),
      topic2: web3.eth.abi.decodeParameter('bytes32', item.topic2),
      topic3: web3.eth.abi.decodeParameter('bytes32', item.topic3),
      data: web3.eth.abi.decodeParameters(dataTypes, item.data),
    };
  }

  async addMoralisLogs(
    status: ProfileMoralisStatus,
    content: string,
  ): Promise<ProfileMoralisLogs> {
    const logs = this.profileMoralisLogsRepository.create({ status, content });
    return this.profileMoralisLogsRepository.save(logs);
  }

  async getMoralisContractLogs(
    getMoralisLogsDto?: GetMoralisLogsDto,
  ): Promise<MoralisLogsResponseDto> {
    const web3 = new Web3();

    const { provider, ...filter } = getMoralisLogsDto;

    const params: Record<string, any> = {
      chain: process.env.ACHIEVEMENT_CONTRACT_CHAIN,
      topic0: process.env.ACHIEVEMENT_EVENT_TOPIC,
      from_block: 0,
      ...filter,
    };

    if (provider) {
      params.topic3 = web3.utils.sha3(provider);
    }

    const transactions = await firstValueFrom(
      this.httpService.get(
        `${MORALIS_SERVER_URL}/${process.env.ACHIEVEMENT_CONTRACT_ADDRESS}/logs`,
        {
          params,
          headers: { 'X-API-Key': MORALIS_API_KEY },
          timeout: 5000,
        },
      ),
    ).then((res) => res.data);

    return {
      ...transactions,
      result: transactions.result.map(this.mapMoralisLogsItem),
    };
  }

  async getGameInfo(
    gameId: Game['id'],
    userId: User['id'],
  ): Promise<ProfileGameDto> {
    const user = await this.usersService.findById(String(userId), ['wallets']);

    return this.getGameUserEarnSpend(gameId, user);
  }

  async getGameList(
    userId: User['id'],
    options?: GetProfileGamesDto,
  ): Promise<ProfileGamesDto> {
    const { limit = 10, offset = 0, is_on_chain = true } = options || {};

    const user = await this.usersService.findById(String(userId), ['wallets']);

    const [games, count] = await this.gamesService.findAndCount({
      relations: ['achievements'],
      take: limit,
      skip: offset,
      where: { is_on_chain, in_use: true },
    });

    const profileGameList = await this.getGamesUserEarnSpend(games, user);

    return new ProfileGamesDto({
      total: {
        earning: profileGameList.reduce(
          (acc, { stats: { earn } }) => (acc += earn),
          0,
        ),
        spending: profileGameList.reduce(
          (acc, { stats: { spend } }) => (acc += spend),
          0,
        ),
      },
      items: profileGameList,
      count,
    });
  }

  async getMe(userId: User['id']): Promise<ProfileMeDto> {
    const { mintedAchievements, records } = await this.usersService
      .findById(userId.toString(), [
        'mintedAchievements',
        'mintedAchievements.achievement',
        'records',
      ])
      .catch((err) => {
        this.logger.error(new Error(err));

        throw new BadRequestException(err.message, err.stack);
      });

    const points = this.getPointsByAchievements(mintedAchievements);

    const balance = records.reduce((acc, curr) => curr.amount + acc, 0);

    return new ProfileMeDto({
      points,
      level: Math.floor(points / PROFILE_LEVEL_DELIMITER),
      image: '',
      balance,
    });
  }

  getPointsByAchievements(achievements: UserMintedAchievement[]): number {
    return achievements
      .filter(({ achievement }) => !!achievement.name)
      .reduce((acc, curr) => {
        return acc + curr.achievement.scores;
      }, 0);
  }

  async getGameAchievements(
    gameId: Game['id'],
    userId?: User['id'],
  ): Promise<AchievementDto[]> {
    const [profileAchievementIds, { achievements }, user] = await Promise.all([
      this.getProfileAchievementIds(userId).catch(() => []),
      this.gamesService.findOne(gameId, ['achievements', 'achievements.user']),
      this.usersService.findById(userId.toString()).catch(() => null),
    ]);

    let mintedAchievements = { status: ProfileMoralisStatus.FAIL, data: [] };

    if (user) {
      mintedAchievements = await this.getMintedAchievements(user).catch(() => ({
        status: ProfileMoralisStatus.FAIL,
        data: [],
      }));
    }

    return achievements
      .filter((achievement) => !!achievement.name)
      .map((achievement) => {
        const usersEarned = achievement?.minter?.length;

        delete achievement?.minter;
        delete achievement?.user;

        return new AchievementDto({
          ...this.buildAchievementWithStatus(
            { ...achievement },
            profileAchievementIds,
            mintedAchievements.data,
          ),
          usersEarned,
        });
      });
  }

  async getGameListWithAchievements(
    userId?: number,
  ): Promise<ProfileAchievementGameDto[]> {
    try {
      const games = await this.connection.query(`
      SELECT
        COUNT(a.id)::int AS achievements,
        COUNT(a2.id)::int AS earned_achievements,
        g.id,
        g.title,
        g.logo
      FROM
        achievement a
        LEFT JOIN game g ON g.id = a. "gameId"
        LEFT JOIN user_achievement a2 ON a2. "userId" = ${userId}
          AND a2. "achievementId" = a.id
      WHERE
        g.is_on_chain = TRUE AND
        a.name IS NOT NULL
      GROUP BY
        g.id,
        g.logo,
        g.title
      ORDER BY
        earned_achievements DESC;
    `);

      return games.map((game) =>
        plainToInstance(ProfileAchievementGameDto, game, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      throw new BadRequestException(error.message, error);
    }
  }

  async getEarnedAchievements(user: User): Promise<AchievementDto[]> {
    const [userAchievements, mintedAchievements] = await Promise.all([
      this.usersService.getUserAchievements(user.id, [
        'achievement',
        'achievement.game',
      ]),
      this.getMintedAchievements(user),
    ]);

    return userAchievements
      .filter(
        ({ achievement }) =>
          !mintedAchievements.data.includes(achievement?.id) &&
          !!achievement.name,
      )
      .map(({ achievement }) => new AchievementDto(achievement));
  }

  async getAchievements(user: User): Promise<ProfileGameAchievementDto[]> {
    const [profileAchievementIds, gamesIds, mintedAchievements] =
      await Promise.all([
        this.getProfileAchievementIds(user.id),
        this.gamesService.getGameIds(),
        this.getMintedAchievements(user),
      ]);

    const gamesAchievements = await this.gamesService.findAllByIds(gamesIds, [
      'achievements',
    ]);

    const profileGameAchievements = gamesAchievements.map(
      ({ achievements, ...game }) =>
        new ProfileGameAchievementDto({
          game,
          total_achievements: achievements.length,
          mint_status: mintedAchievements.status,
          achievements: achievements
            .map((achievement) => {
              return this.buildAchievementWithStatus(
                achievement,
                profileAchievementIds,
                mintedAchievements.data,
              );
            })
            .filter(
              (achievement) =>
                achievement.status !== AchievementStatus.DISABLED &&
                !!achievement.name,
            ),
        }),
    );

    return profileGameAchievements.filter((item) => item.achievements.length);
  }

  async getStatus(userId: User['id']): Promise<ProfileStatusDto> {
    const achievementProcessing =
      await this.achievementsService.statusProcessing({ userId });

    return new ProfileStatusDto({
      achievementProcessing,
    });
  }

  async getUserProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.usersService.findById(userId.toString(), [
      'achievements',
      'achievements.achievement',
      'achievements.achievement.game',
    ]);

    const games = user.achievements
      .filter(({ achievement }) => !!achievement.name)
      .map((achievement) => achievement?.achievement?.game?.id)
      .filter((id, index, self) => self.indexOf(id) === index);

    return plainToInstance(
      UserProfileDto,
      {
        id: user.id,
        name: user.displayedName,
        wallet: user.walletAddress,
        total_achievements: user.achievements.length,
        total_games: games.length,
        avatar: this.usersService.getUserAvatar(user),
      },
      { excludeExtraneousValues: true },
    );
  }

  private setLeaderboardModifiers(
    data: LeaderboardDto[],
    limit: number,
    page: number,
    sort: LeaderboardSort,
    myUserId: string,
    q: string,
  ): { data: LeaderboardDto[]; meta: MetaListDto } {
    // Sort data by points
    data.sort((a, b) => {
      return b.points - a.points;
    });

    // Update indexes
    data.forEach((item, index) => {
      data[index].index = index;
    });

    const fullData: LeaderboardDto[] = cloneDeep(data);

    // Filter data by name and wallet
    data = this.setLeaderboardSearch(data, q);

    // Set meta
    const meta = {
      total_items: data.length,
      total_pages: Math.round(data.length / limit),
      current_page: page,
    };

    // Set sorters
    data = this.setLeaderboardSort(sort, data);

    // Pagination result data
    data = this.setLeaderboardPagination(page, limit, data);

    // Set me first
    if (myUserId) {
      data = this.setMeFirst(data, fullData, myUserId);
    }

    return { meta, data };
  }

  async getUserProfileAchievements(
    userId: number,
  ): Promise<ProfileGameAchievementDto[]> {
    const user = await this.usersService.findById(userId.toString());

    return this.getAchievements(user);
  }

  async getLeaderboard(
    query: LeaderboardQueryDto,
    myUserId: string,
  ): Promise<ListDto<LeaderboardDto>> {
    const { filter, sort, q = '' } = query;
    let { limit = 25, page = 1 } = query;

    limit = Number(limit);
    page = Number(page);

    let byDays = 360 as LeaderboardDays;

    if (filter?.by_days) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      byDays = Number<string>(filter?.by_days);
    }

    const byDay: string = moment(new Date())
      .subtract(byDays, 'd')
      .format('YYYY-MM-DD');

    const preparedData: LeaderboardDto[] = await this.prepareLeaderboardData(
      byDay,
    );

    if (preparedData) {
      const { data, meta } = this.setLeaderboardModifiers(
        preparedData,
        limit,
        page,
        sort,
        myUserId,
        q,
      );

      return new ListDto<LeaderboardDto>({
        data: data,
        meta: meta,
      });
    } else {
      throw new BadRequestException('Failed get leaderboard list');
    }
  }
}
