import * as fs from 'fs';
import * as moment from 'moment';
import { createObjectCsvWriter } from 'csv-writer';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import {
  Connection,
  FindConditions,
  ILike,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Game, GameCode } from './entities/game.entity';
import { plainToInstance } from 'class-transformer';
import { GameDto } from './dto/game.dto';
import { SocialStatsExtendedDto } from 'src/socials/dto/social-stats-extended.dto';
import { SocialsService } from 'src/socials/socials.service';
import {
  SocialChannel,
  SocialServiceList,
} from 'src/socials/entities/social-channel.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { GameAdditionalInfo } from './entities/game-additional-info.entity';
import { AddGameAdditionalInfoDto } from './dto/add-game-additional-info.dto';
import { UpcomingGameDto } from './dto/upcoming-game.dto';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { GetUpcomingGamesDto } from './dto/get-upcoming-games.dto';
import { AddSocialChannelDto } from 'src/socials/dto/add-social-channel.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GetGamesListDto } from './dto/get-games-list.dto';
import { CsvParser } from 'nest-csv-parser';
import { GameDateEstimation } from './enums/game-date-estimation.enum';
import { UpcomingSortType } from './enums/upcoming-sort-type.enum';
import { SocialStats } from 'src/socials/entities/social-stats.entity';
import { SortOrderType } from 'src/common/enums/sort-order-type.enum';
import { GetGameInfoDto } from './dto/get-games-info.dto';
import { GetGameListOptionsDto } from './dto/GetGameListOptions.dto';
import { GameRiskLevel } from './enums/game-risk-level.enum';
import { GameTokenContractDto } from './dto/game-token-contract.dto';
import { TokenContract } from 'src/chain-parser/entities/token-contract.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { GamesInfoListItemDto } from './dto/games-info-list-item.dto';
import { GamesInfoDetailItemDto } from './dto/games-info-detail-item.dto';
import { GamesInfoStatsDto } from './dto/games-info-stats.dto';
import { NFTStorage, File } from 'nft.storage';
import { GameMetadataDto } from './dto/game-metadata.dto';

export type AdditionalInfoResponse = {
  [k in
    | 'players_count'
    | 'min_investment_usd'
    | 'monthly_return_token'
    | 'monthly_return_usd'
    | 'payback_token'
    | 'payback_usd'
    | 'apy_usd']: number;
};

export type SocialCommunitiesResponse = {
  twitter: Pick<
    SocialStatsExtendedDto,
    'date' | 'members_count' | 'members_growth' | 'members_growth_percentage'
  >;
  discord: Pick<
    SocialStatsExtendedDto,
    'date' | 'members_count' | 'members_growth' | 'members_growth_percentage'
  >;
  telegram: Pick<
    SocialStatsExtendedDto,
    'date' | 'members_count' | 'members_growth' | 'members_growth_percentage'
  >;
};

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @InjectRepository(Game) private gamesRepository: Repository<Game>,
    @InjectRepository(GameAdditionalInfo)
    private gamesAdditionalInfoRepository: Repository<GameAdditionalInfo>,
    private readonly socialService: SocialsService,
    private readonly csvParser: CsvParser,
    private httpService: HttpService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async getGameIds(): Promise<Game['id'][]> {
    const games = await this.gamesRepository.find({
      select: ['id'],
      where: [{ is_on_chain: true }, { is_on_chain: false }],
    });

    return games.map(({ id }) => id);
  }

  async findAndCount(
    options?: GetGameListOptionsDto,
  ): Promise<[Game[], number]> {
    const { relations, select, where, take, skip } = options || {};
    return this.gamesRepository.findAndCount({
      ...(relations && { relations }),
      ...(select && { select }),
      ...(where && { where }),
      ...(take != null && { take }),
      ...(skip != null && { skip }),
    });
  }

  findAllByIds(ids: Game['id'][], relations?: string[]): Promise<Game[]> {
    return this.gamesRepository.find({
      where: { id: In(ids) },
      ...(relations && { relations }),
    });
  }

  async findOneByCode(code: GameCode): Promise<GameDto> {
    const game = await this.gamesRepository.findOne({ where: { code } });

    if (!game) {
      throw new NotFoundException(`Can not find game by code: ${code}`);
    }

    return plainToInstance(GameDto, game, { excludeExtraneousValues: true });
  }

  async find(
    filter: FindConditions<Game> | FindConditions<Game>[],
    relations?: string[],
  ): Promise<Game[]> {
    const games = await this.gamesRepository.find({
      where: filter,
      relations,
    });

    if (!games.length) {
      return [];
    }

    return games;
  }

  async findAll(getGamesListDto: GetGamesListDto): Promise<GameDto[]> {
    const retrievedGames = await this.gamesRepository.find({
      where: getGamesListDto,
      order: { id: 'DESC' },
    });

    return plainToInstance(GameDto, retrievedGames, {
      excludeExtraneousValues: true,
    });
  }

  async findAllWithoutUpcoming(payload: GetGameInfoDto): Promise<GameDto[]> {
    const retrievedGames = await this.gamesRepository.find({
      where: {
        ...payload,
        in_use: true,
      },
    });

    return plainToInstance(GameDto, retrievedGames, {
      excludeExtraneousValues: true,
    });
  }

  async getUpcomingList(
    getUpcomingListDto: GetUpcomingGamesDto,
  ): Promise<ItemsListResponseDto<UpcomingGameDto>> {
    const {
      search,
      limit = '10',
      offset = '0',
      sort,
      sortType,
    } = getUpcomingListDto;

    const filter: FindConditions<Game> = { is_upcoming: true };

    if (search) {
      filter.title = ILike(`%${search}%`);
    }

    const [startTime, endTime] = [new Date(), new Date()];
    startTime.setDate(startTime.getDate() - 1);
    endTime.setDate(endTime.getDate() - 2);

    const date = new Date();
    date.setDate(date.getDate() - 7);
    const startedAt = date.toISOString().slice(0, 10);

    const query = this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.additional_info', 'info')
      .where({ ...filter })
      .leftJoinAndMapOne(
        'game.ino',
        'game.additional_info',
        'ino',
        `ino.ino_date >= ${
          !sort ? `'${startedAt}'` : 'CURRENT_DATE'
        } and ino.marketplace = ''`,
      )
      .leftJoinAndMapOne(
        'game.ido',
        'game.additional_info',
        'ido',
        `ido.ido_date >= ${
          !sort ? `'${startedAt}'` : 'CURRENT_DATE'
        } and ido.ido_status != 'Over'`,
      )
      .leftJoinAndMapOne(
        'game.release',
        'game.additional_info',
        'release',
        `release.release_date >= ${
          !sort ? `'${startedAt}'` : 'CURRENT_DATE'
        } and release.release_status != 'Released'`,
      )
      .select([
        'game.id',
        'game.title',
        'game.site',
        'game.is_upcoming',
        'game.logo',
        'ino.ino_date',
        'ido.ido_date',
        'release.release_date',
        'info',
      ]);

    switch (sort) {
      case UpcomingSortType.TREND:
        query
          .leftJoinAndMapOne(
            'game.twitterChannel',
            SocialChannel,
            'twitterChannel',
            `twitterChannel.game_id = game.id and twitterChannel.service = '${SocialServiceList.TWITTER}'`,
          )
          .leftJoinAndMapOne(
            'game.twitterStats',
            SocialStats,
            'twitterStats',
            `twitterStats.game_id = game.id AND twitterStats.channel_id = twitterChannel.id AND twitterStats.date IN ('${startTime
              .toISOString()
              .slice(0, 10)}','${endTime.toISOString().slice(0, 10)}')`,
          )
          .orderBy(
            'twitterStats.members_count',
            SortOrderType.DESC,
            'NULLS LAST',
          );
        break;
      case UpcomingSortType.IDO_DATE:
        query.orderBy(`ido.${sort}`, sortType);
        break;
      case UpcomingSortType.INO_DATE:
        query.orderBy(`ino.${sort}`, sortType);
        break;
      case UpcomingSortType.RELEASE_DATE:
        query.orderBy(`release.${sort}`, sortType);
        break;
      case UpcomingSortType.TITLE:
        query.orderBy(`game.${sort}`, sortType);
        break;
      case UpcomingSortType.ONGOING:
        query.andWhere(
          `info.ino_status = 'Ongoing' OR info.ido_status = 'Ongoing'`,
        );
        break;
      default:
        query
          .orderBy('release.release_date', 'ASC', 'NULLS LAST')
          .addOrderBy('ido.ido_date', 'ASC', 'NULLS LAST')
          .addOrderBy('ino.ino_date', 'ASC', 'NULLS LAST');
    }

    query
      .skip(Number(offset))
      .take(Number(limit))
      .leftJoinAndMapOne(
        'game.channel',
        SocialChannel,
        'channel',
        `channel.game_id = game.id and channel.service = '${SocialServiceList.TWITTER}'`,
      )
      .leftJoinAndMapMany(
        'game.twitter',
        SocialStats,
        'stats',
        `stats.game_id = game.id AND stats.channel_id = channel.id AND stats.date IN ('${startTime
          .toISOString()
          .slice(0, 10)}','${endTime.toISOString().slice(0, 10)}')`,
      );

    if (sort === UpcomingSortType.TREND) {
      query
        .leftJoinAndMapOne(
          'game.discordChannel',
          SocialChannel,
          'discordChannel',
          `discordChannel.game_id = game.id and discordChannel.service = '${SocialServiceList.DISCORD}'`,
        )
        .leftJoinAndMapMany(
          'game.discord',
          SocialStats,
          'discordStats',
          `discordStats.game_id = game.id AND discordStats.channel_id = discordChannel.id AND discordStats.date >= '${startTime
            .toISOString()
            .slice(0, 10)}'`,
        );
    }

    const [items, count] = await query.getManyAndCount();

    const games = items.map((item) => {
      const twitter = this.socialService.mapTwitterStats(
        (item as any)?.twitter,
      );

      const discord = this.socialService.mapDiscordStats(
        (item as any)?.discord,
      );

      return {
        ...item,
        marketplace: item.additional_info?.marketplace ?? null,
        ino_date: item.additional_info?.ino_date ?? null,
        ino_date_estimation: item.additional_info?.ino_date_estimation ?? null,
        ino_status: item.additional_info?.ino_status ?? null,
        token: item.additional_info?.token_name ?? null,
        ido_status: item.additional_info?.ido_status ?? null,
        chains: item.additional_info?.chains ?? null,
        ido_date: item.additional_info?.ido_date ?? null,
        ido_date_estimation: item.additional_info?.ido_date_estimation ?? null,
        release_status: item.additional_info?.release_status ?? null,
        release_date: item.additional_info?.release_date ?? null,
        release_date_estimation:
          item.additional_info?.release_date_estimation ?? null,
        communities: { twitter, discord },
      };
    });

    return {
      items: plainToInstance(UpcomingGameDto, games, {
        excludeExtraneousValues: true,
      }),
      count,
    };
  }

  async getUpcomingGameById(id: number): Promise<UpcomingGameDto> {
    const item = await this.gamesRepository
      .createQueryBuilder('game')
      .where({ id })
      .leftJoinAndSelect('game.additional_info', 'info')
      .leftJoinAndMapMany(
        'game.links',
        SocialChannel,
        'link',
        "link.game_id = game.id and NOT link.channel = ''",
      )
      .getOne();

    const game = {
      ...item,
      pictures: item.additional_info?.pictures ?? null,
      video: item.additional_info?.video ?? null,
      backers: item.additional_info?.backers ?? null,
      chains: item.additional_info?.chains ?? null,
      marketplace: item.additional_info?.marketplace ?? null,
      ino_date: item.additional_info?.ino_date ?? null,
      ino_date_estimation: item.additional_info?.ino_date_estimation ?? null,
      ino_status: item.additional_info?.ino_status ?? null,
      token: item.additional_info?.token_name ?? null,
      ido_platforms: item.additional_info?.ido_platforms ?? null,
      ido_status: item.additional_info?.ido_status ?? null,
      ido_date: item.additional_info?.ido_date ?? null,
      ido_date_estimation: item.additional_info?.ido_date_estimation ?? null,
      release_status: item.additional_info?.release_status ?? null,
      release_date: item.additional_info?.release_date ?? null,
      release_date_estimation:
        item.additional_info?.release_date_estimation ?? null,
    };

    return plainToInstance(UpcomingGameDto, game, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number, relations: string[] = []): Promise<Game> {
    const game = await this.gamesRepository.findOne({
      where: { id },
      relations,
    });

    if (!game) {
      throw new NotFoundException(`Can not found game by id: ${id}`);
    }

    return game;
  }

  async getGameInfo(id: number): Promise<GamesInfoDetailItemDto> {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      const lastMonth = date.toISOString().slice(0, 10);

      const game = await this.gamesRepository
        .createQueryBuilder('game')
        .where('game.id = :gameId', {
          gameId: id,
        })
        .leftJoinAndSelect(
          'game.usersStats',
          'stats',
          `stats.createdAt >= '${lastMonth}'`,
        )
        .leftJoinAndMapMany(
          'game.links',
          SocialChannel,
          'link',
          "link.game_id = game.id and NOT link.channel = ''",
        )
        .getOne();

      const stats = await this.connection.query(`
        SELECT
          COUNT(id)::int
        FROM
          ${game?.chain_title === 'solana' ? 'solana_account' : 'account'}
        WHERE
          game_id = ${id}
          AND is_contract = FALSE
      `);

      const { earnings, spending, earners, players } = game?.usersStats.reduce(
        (data, player) => {
          let earnings = data.earnings;
          let spending = data.spending;
          let earners = data.earners;
          let players = data.players;

          earnings += player.newEarnings;
          spending += Math.abs(player.newSpending);
          earners += player.newEarners;
          players += player.newPayingUsers;

          return { earnings, spending, earners, players };
        },
        {
          earnings: 0,
          spending: 0,
          earners: 0,
          players: 0,
        },
      ) || {
        earnings: 0,
        spending: 0,
        earners: 0,
        players: 0,
      };

      const profit = earners / players;
      const avgRoi = (earnings - spending) / spending;
      const riskLevel = profit * avgRoi;

      const obj = {
        ...game,
        stats: {
          players_count: parseInt(stats[0]?.count, 10) || 0,
          new_users: players,
          profit: profit * 100,
          avg_roi: avgRoi,
          risk_level:
            riskLevel > 1.5
              ? GameRiskLevel.LOW
              : riskLevel < 1
              ? GameRiskLevel.HIGH
              : GameRiskLevel.MEDIUM,
        },
      };

      return plainToInstance(GamesInfoDetailItemDto, obj, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(error.message, error);
    }
  }

  async getGameInfoList(
    payload: GetGameInfoDto,
  ): Promise<GamesInfoListItemDto[]> {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const lastMonth = date.toISOString().slice(0, 10);

    const [startTime, endTime] = [new Date(), new Date()];
    startTime.setDate(startTime.getDate() - 1);
    endTime.setDate(endTime.getDate() - 2);

    const games: any = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.usersStats', 'stats')
      .where('game.in_use = TRUE AND stats.createdAt >= :lastMonth', {
        lastMonth,
      })
      .leftJoinAndMapOne(
        'game.channel',
        SocialChannel,
        'channel',
        `channel.game_id = game.id and channel.service = '${SocialServiceList.TWITTER}'`,
      )
      .leftJoinAndMapMany(
        'game.twitter',
        SocialStats,
        'twitter',
        `twitter.game_id = game.id AND twitter.channel_id = channel.id AND twitter.date IN ('${startTime
          .toISOString()
          .slice(0, 10)}','${endTime.toISOString().slice(0, 10)}')`,
      )
      .orderBy('game.id', 'ASC')
      .getMany();

    if (!games.length) {
      throw new NotFoundException('Games not found');
    }

    const result = games.map(({ usersStats, twitter, ...game }) => {
      const { earnings, spending, earners, players } = usersStats.reduce(
        (data, player) => {
          let earnings = data.earnings;
          let spending = data.spending;
          let earners = data.earners;
          let players = data.players;

          earnings += player.newEarnings;
          spending += Math.abs(player.newSpending);
          earners += player.newEarners;
          players += player.newPayingUsers;

          return { earnings, spending, earners, players };
        },
        {
          earnings: 0,
          spending: 0,
          earners: 0,
          players: 0,
        },
      );

      const twitterStats: any = this.socialService.mapTwitterStats(twitter);
      const stats: Partial<GamesInfoStatsDto> = { twitter: twitterStats };
      stats.new_users = players;
      stats.profit = (earners / players) * 100;
      stats.avg_roi = (earnings - Math.abs(spending)) / Math.abs(spending);

      const riskLevel = stats.profit * stats.avg_roi;
      stats.risk_level =
        riskLevel > 1.5
          ? GameRiskLevel.LOW
          : riskLevel < 1
          ? GameRiskLevel.HIGH
          : GameRiskLevel.MEDIUM;

      return plainToInstance(
        GamesInfoListItemDto,
        { ...game, stats },
        {
          excludeExtraneousValues: true,
        },
      );
    });

    return result;
  }

  async getGameTokensInfo(gameId: number): Promise<GameTokenContractDto[]> {
    const data = await this.gamesRepository
      .createQueryBuilder('game')
      .where({ id: gameId })
      .leftJoinAndMapMany(
        'game.tokens',
        TokenContract,
        'token',
        `token.game_id = game.id AND token.is_coin = true AND token.title != 'UNKNOWN'`,
      )
      .getOne();

    if (!data) {
      throw new NotFoundException('Game not found');
    }

    if (!(data as any).tokens?.length) {
      return [];
    }

    const tokenQueries = (data as any).tokens.map(async (token) => {
      const url = `https://api.coingecko.com/api/v3/coins/${token.chain_id}/contract/${token.address}`;

      const result = await firstValueFrom(this.httpService.get(url))
        .then((res) => res.data)
        .catch((err) => {
          const e = new Error(err.message);
          this.logger.error(`Error with token ${token.chain_id}`, e);

          return null;
        });

      if (!result) {
        return null;
      }

      const data = {
        ...token,
        ticker: token.title,
        image: result?.image || null,
        price: result?.market_data.current_price.usd || null,
        price_delta:
          result?.market_data.price_change_percentage_24h_in_currency.usd /
            100 || null,
        market_cap: result?.market_data.market_cap.usd || null,
        market_cap_delta:
          result?.market_data.market_cap_change_percentage_24h_in_currency.usd /
            100 || null,
      };

      return plainToInstance(GameTokenContractDto, data, {
        excludeExtraneousValues: true,
      });
    });

    try {
      const tokens = await Promise.all(tokenQueries);

      return tokens.filter((el) => !!el);
    } catch (error) {
      throw new BadRequestException(error.message, error);
    }
  }

  async create(createGameDto: CreateGameDto): Promise<GameDto> {
    try {
      const data = this.gamesRepository.create(createGameDto);
      const game = await this.gamesRepository.save(data);

      return plainToInstance(GameDto, game, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addAdditionalInfo(
    id: string,
    addAdditionalInfo: AddGameAdditionalInfoDto,
  ): Promise<GameAdditionalInfo> {
    const game = await this.gamesRepository.findOne({ where: { id } });

    try {
      const data = this.gamesAdditionalInfoRepository.create(addAdditionalInfo);
      game.additional_info = data;
      game.is_upcoming = true;

      await this.gamesAdditionalInfoRepository.save(data);
      await this.gamesRepository.save(game);

      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addSocialChannel(
    id: string,
    addSocialChannelDto: AddSocialChannelDto,
  ): Promise<SocialChannel> {
    const game = await this.findOne(Number(id));

    return this.socialService.createSocialChannel(game.id, addSocialChannelDto);
  }

  async update(id: string, updateGameDto: UpdateGameDto): Promise<void> {
    const game = await this.findOne(Number(id));

    try {
      const updated = { ...game, ...updateGameDto };
      await this.gamesRepository.save(updated);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.gamesRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteSocialChannel(id: string, socialId: string): Promise<void> {
    const socials = await this.socialService.getSocialLinkList(Number(id));

    if (socials.some((social) => social.id === Number(socialId))) {
      await this.socialService.deleteSocialChannel(Number(socialId));
    }
  }

  async importGamesCsv(file: Express.Multer.File) {
    await this.parseGamesCsv(file.path);
  }

  async exportGamesToCsv(): Promise<string> {
    const header = [
      { id: 'id', title: 'N' },
      { id: 'logo', title: 'Logo' },
      { id: 'pictures', title: 'Pics links' },
      { id: 'videos', title: 'Video link' },
      { id: 'description', title: 'Game description' },
      { id: 'title', title: 'Game name' },
      { id: 'genre', title: 'Genre' },
      { id: 'chains', title: 'Blockchain' },
      { id: 'token_name', title: 'Token name' },
      { id: 'ido_date', title: 'IDO date' },
      { id: 'ido_status', title: 'IDO status' },
      { id: 'ido_platforms', title: 'IDO Platforms' },
      { id: 'marketplace', title: 'Platforms' },
      { id: 'ino_date', title: 'INO date' },
      { id: 'release_status', title: 'Release status' },
      { id: 'release_date', title: 'Release date' },
      { id: 'backers', title: 'Backers' },
      { id: 'site', title: 'Game website' },
      { id: 'twitter', title: 'Twitter Link' },
      { id: 'discord', title: 'Discord Link' },
      { id: 'telegram', title: 'TG Channel' },
      { id: 'telegram_chat', title: 'TG Chat' },
      { id: 'medium', title: 'Medium link' },
    ];

    const games: any = await this.gamesRepository
      .createQueryBuilder('game')
      .where('game.is_upcoming = true')
      .leftJoinAndSelect('game.additional_info', 'info')
      .leftJoinAndMapOne(
        'game.twitter',
        SocialChannel,
        'twitter',
        `twitter.game_id = game.id and twitter.service = '${SocialServiceList.TWITTER}'`,
      )
      .leftJoinAndMapOne(
        'game.discord',
        SocialChannel,
        'discord',
        `discord.game_id = game.id and discord.service = '${SocialServiceList.DISCORD}'`,
      )
      .leftJoinAndMapOne(
        'game.telegram',
        SocialChannel,
        'telegram',
        `telegram.game_id = game.id and telegram.service = '${SocialServiceList.TELEGRAM}'`,
      )
      .leftJoinAndMapOne(
        'game.telegram_chat',
        SocialChannel,
        'telegram_chat',
        `telegram_chat.game_id = game.id and telegram_chat.service = '${SocialServiceList.TELEGRAM_CHAT}'`,
      )
      .leftJoinAndMapOne(
        'game.medium',
        SocialChannel,
        'medium',
        `medium.game_id = game.id and medium.service = '${SocialServiceList.MEDIUM}'`,
      )
      .getMany();

    const formatDate = (date: Date, estimation: GameDateEstimation): string => {
      if (!moment(date).isValid()) return 'TBA';

      switch (estimation) {
        case GameDateEstimation.year:
          return moment(date).format('YYYY');

        case GameDateEstimation.quarter:
          return `Q${moment(date).format('Q YYYY')}`;

        case GameDateEstimation.month:
          return moment(date).format('MMMM YYYY');

        default:
          return moment(date).format('YYYY/MM/DD');
      }
    };

    const records = games.map((game) => ({
      id: game.id,
      logo: game.logo,
      pictures: game.additional_info?.pictures.join(', '),
      videos: game.additional_info?.video.join(', '),
      description: game.description,
      title: game.title,
      genre: game.genre,
      chains: game.additional_info?.chains,
      token_name: game.additional_info?.token_name,
      ido_platforms: game.additional_info?.ido_platforms,
      ido_status: game.additional_info?.ido_status,
      marketplace: game.additional_info?.marketplace,
      release_status: game.additional_info?.release_status,
      backers: game.additional_info?.backers,
      site: game.site,
      ino_date: formatDate(
        game.additional_info?.ino_date,
        game.additional_info?.ino_date_estimation,
      ),
      ido_date: formatDate(
        game.additional_info?.ido_date,
        game.additional_info?.ido_date_estimation,
      ),
      release_date: formatDate(
        game.additional_info?.release_date,
        game.additional_info?.release_date_estimation,
      ),
      twitter: game.twitter?.channel,
      discord: game.discord?.channel,
      telegram: game.telegram?.channel,
      telegram_chat: game.telegram_chat?.channel,
      medium: game.medium?.channel,
    }));

    const path = `./upload/calendar-${Date.now()}.csv`;
    const csvWriter = createObjectCsvWriter({
      path,
      header,
    });

    try {
      await csvWriter.writeRecords(records);

      return path;
    } catch (error) {
      throw new BadRequestException('Error exporting upcoming games');
    }
  }

  async getMetadataList(): Promise<GameMetadataDto[]> {
    const games = await this.gamesRepository.find({
      where: { logo: Not(IsNull()) },
      order: { id: 'ASC' },
    });

    if (!games.length) {
      return [];
    }

    return games.map((game) =>
      plainToInstance(GameMetadataDto, game, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getDetailMetadata(id: number): Promise<GameMetadataDto> {
    const game = await this.gamesRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return plainToInstance(GameMetadataDto, game, {
      excludeExtraneousValues: true,
    });
  }

  async pushMetadata(): Promise<{ folderURI: string }> {
    if (!process.env.NFT_STORE_API_KEY) {
      throw new BadRequestException('Storage key was not found');
    }

    const client = new NFTStorage({ token: process.env.NFT_STORE_API_KEY });
    const games = await this.gamesRepository.find({
      where: { logo: Not(IsNull()) },
    });

    if (!games.length) {
      throw new NotFoundException('Games not found');
    }

    try {
      const imageQueries = games
        .filter(({ logo }) => !!logo.trim())
        .map(async ({ logo, id }) => {
          const res = await firstValueFrom(
            this.httpService.get(logo, { responseType: 'arraybuffer' }),
          );

          return new File([res.data], `${id}.png`, { type: 'image/png' });
        });

      const images = await Promise.all(imageQueries);
      const imagesDirectory = await NFTStorage.encodeDirectory(images);

      const files = games.map(({ id, title }) => {
        const data = {
          id,
          title,
          icon: `https://ipfs.io/ipfs/${imagesDirectory.cid}/${id}.png`,
        };

        return new File([JSON.stringify(data, null, 2)], `${id}.json`);
      });

      const filesDirectory = await NFTStorage.encodeDirectory(files);

      await Promise.all([
        client.storeCar(imagesDirectory.car),
        client.storeCar(filesDirectory.car),
      ]);

      return { folderURI: `https://ipfs.io/ipfs/${filesDirectory.cid}` };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException('Error pushing games metadata');
    }
  }

  private async parseGamesCsv(filePath: string) {
    class TableEntity {
      n: string;
      logo: string;
      pics_links: string;
      video_link: string;
      game_description: string;
      game_name: string;
      genre: string;
      token_name: string;
      ido_date: string;
      ido_platforms: string;
      ido_status: string;
      ino_date: string;
      platforms: string;
      ino_status: string;
      backers: string;
      release_date: string;
      release_status: string;
      game_website: string;
      twitter_link: string;
      discord_link: string;
      tg_channel: string;
      tg_chat: string;
      medium_link: string;
      blockchain: string;
    }

    const stream = fs.createReadStream(filePath);
    const entities = await this.csvParser.parse(
      stream,
      TableEntity,
      null,
      null,
      {
        separator: ',',
        mapHeaders: ({ header }) => header.toLowerCase().replace(' ', '_'),
        mapValues: ({ header, index, value }) => {
          if (value && value !== 'TBA' && value !== '—') return value;

          return '';
        },
      },
    );

    const [existedGames, irrelevantGames] = await Promise.all([
      this.gamesRepository
        .find({
          where: { title: In(entities.list.map((el) => el.game_name)) },
        })
        .catch((e) => {
          this.logger.error(`existedGames::error`, e.stack);
          return [];
        }),
      this.gamesRepository
        .find({
          where: {
            is_upcoming: true,
            title: Not(In(entities.list.map((el) => el.game_name))),
          },
        })
        .catch((e) => {
          this.logger.error(`irrelevantGames::error`, e.stack);
          return [];
        }),
    ]);

    const irrelevantQueries = irrelevantGames.map((game) => ({
      ...game,
      is_upcoming: false,
    }));

    const parseDate = (
      initialDate: string,
    ): { date: Date; estimation: GameDateEstimation } => {
      const estimations = {
        [GameDateEstimation.day]: 'YYYY/MM/DD',
        [GameDateEstimation.month]: 'MMMM YYYY',
        [GameDateEstimation.quarter]: 'Q YYYY',
        [GameDateEstimation.year]: 'YYYY',
      };

      return Object.entries(estimations).reduce<any>(
        (result, [estimation, format]) => {
          if (!result.date) {
            let date: moment.Moment | Date = moment(
              initialDate[0] === 'Q' ? initialDate.slice(1) : initialDate,
              format,
              true,
            );

            if (date.isValid()) {
              if (estimation === GameDateEstimation.quarter) {
                date = date.endOf('quarter');
              }

              if (estimation === GameDateEstimation.month) {
                date = date.endOf('month');
              }

              if (estimation === GameDateEstimation.year) {
                date = date.endOf('year');
              }

              date = date.startOf('day').toDate();

              return { date, estimation };
            }
          }

          return result;
        },
        {
          date: null,
          estimation: GameDateEstimation.day,
        },
      );
    };

    const informationQueries = entities.list.map(
      (entity: TableEntity, index) => {
        const pictures = entity.pics_links.split(',');

        const body: Partial<GameAdditionalInfo> = {
          pictures,
          video: [entity.video_link],
          backers: entity.backers,
          chains: entity.blockchain,
          ido_platforms: entity.ido_platforms,
          ido_status: entity.ido_status,
          release_status: entity.release_status,
          token_name: entity.token_name,
          marketplace: entity.platforms,
          ino_status: entity.ino_status,
        };

        ['ido_date', 'ino_date', 'release_date'].forEach((field) => {
          if (entity[field]) {
            const { date, estimation } = parseDate(entity[field]);

            body[field] = date;
            body[`${field}_estimation`] = estimation;
          }
        });

        return this.gamesAdditionalInfoRepository.create(body);
      },
    );

    try {
      const info = await this.gamesAdditionalInfoRepository.save(
        informationQueries,
      );

      const gamesQueries = entities.list.map((entity: TableEntity, index) => {
        const pictures = entity.pics_links.split(',');

        const gameFields = {
          logo: entity.logo.replace('[', '').replace('\n', '').replace(']', ''),
          image: pictures[0],
          title: entity.game_name,
          description: entity.game_description,
          genre: entity.genre,
          site: entity.game_website,
          additional_info: info[index],
          is_upcoming: true,
        };

        const game = existedGames.find((el) => el.title === entity.game_name);

        if (game) return { ...game, ...gameFields };

        return this.gamesRepository.create(gameFields);
      });

      const games = await this.gamesRepository.save([
        ...gamesQueries,
        ...irrelevantQueries,
      ]);

      const socialQueries = entities.list.map((entity: TableEntity) => {
        const game = games.find((el) => el.title === entity.game_name);

        const links = [
          this.addSocialChannel(game.id.toString(), {
            channel: entity.twitter_link,
            service: SocialServiceList.TWITTER,
          }).catch(() => null),
          this.addSocialChannel(game.id.toString(), {
            channel: entity.discord_link,
            service: SocialServiceList.DISCORD,
          }).catch(() => null),
          this.addSocialChannel(game.id.toString(), {
            channel: entity.tg_channel,
            service: SocialServiceList.TELEGRAM,
          }).catch(() => null),
          this.addSocialChannel(game.id.toString(), {
            channel: entity.tg_chat,
            service: SocialServiceList.TELEGRAM_CHAT,
          }).catch(() => null),
          this.addSocialChannel(game.id.toString(), {
            channel: entity.medium_link,
            service: SocialServiceList.MEDIUM,
          }).catch(() => null),
        ];

        return Promise.all(links);
      });

      await Promise.all(socialQueries);

      this.socialService.aggregateAll().then(
        () => this.logger.log('Aggregated social stats for imported games.'),
        (err: Error) => this.logger.error(err),
      );
    } catch (error) {
      this.logger.error(error);
    }

    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
