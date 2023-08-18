import { InjectQueue } from '@nestjs/bull';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import Bull, { Queue } from 'bull';
import {
  AccountTransferAggregationService,
  ResultOfAchievementRule,
} from 'src/chain-parser/services/account-transfer-aggregation.service';
import { Game } from 'src/games/entities/game.entity';
import { Helpers } from 'src/helpers';
import {
  AchievementProcessorList,
  AchievementQueueList,
} from 'src/types/achievement';
import { UserAchievement } from 'src/users/entities/user-achievement.entity';
import { UserWallet } from 'src/users/entities/user-wallet.entity';
import { User } from 'src/users/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { AchievementProcessingDto } from '../dto/achievement-processing.dto';
import { AchievementProgress } from '../entities/achievement-progress.entity';
import { Achievement } from '../entities/achievement.entity';
import { AchievementProgressStatus } from '../enums/achievement-progress-status.enum';
import { AchievementRuleHandler } from '../enums/achievement-rule-handler';
import { AchievementRuleOperand } from '../enums/achievement-rule-operand.enum';
import { AchievementRule } from '../interfaces/achievement-rule.interface';
import * as fs from 'fs';
import { CsvParser } from 'nest-csv-parser';
import { Cache } from 'cache-manager';
import { AchievementHandlerDto } from '../dto/achievement-handler.dto';

export type AchievementRuleExtended = AchievementRule & { id: number };

export type HandleSpendUSD = {
  wallet: UserWallet;
  amount: number;
  status: boolean;
  rule: AchievementRuleExtended;
};

export type HandleEarnCBT = HandleSpendUSD;

export type AchievementHandlerData = HandleEarnCBT | HandleSpendUSD;

export const CYBALL_CLAIMED_REWARD_ADDRESS =
  '0x8c27e5b1ede44adb61da05c1357f82688fb9e7c6';

export const CYBALL_GAVE_OUT_NFT_TO_RENT_ADDRESSES = [
  '0xa1b6c05e943355ec581bd3f08302f62ae4871184',
  '0x1d5ac255ca612e16a024adee383926607a759aad',
];

export const CYBALL_MADE_A_MENTORING_ADDRESS =
  '0x8cfeaebb2f44f7d69a618081d6b11d40784831c1';

export const XWORLD_NFT_ADDRESS = '0xe6965b4f189dbdb2bd65e60abaeb531b6fe9580b';

export const STAR_SHARK_UPGRADE_YOUR_SHARK_ADDRESS =
  '0x4062113f110be8efe5d8ce662661cc2e30b73c5b';

export const STAR_SHARK_NFT_ADDRESS =
  '0x416f1d70c1c22608814d9f36c492efb3ba8cad4c';

export const METAVERS_MINERS_NFT_ADDRESS =
  '0x4a910310a9ed12d52973dab4886f2d4d7d1c5e05';

export const METAVERS_MINERS_RECHARGE_ENERGY_TIMES_ADDRESS =
  '0x2e3ad85cde82c19578241fde71a82f1a7430b444';

export const BASE_BURN_ADDRESS_1 = '0x0000000000000000000000000000000000000000';
export const BASE_BURN_ADDRESS_2 = '0x0000000000000000000000000000000000000001';
export const BASE_BURN_ADDRESS_3 = '0x000000000000000000000000000000000000dead';

export const X_WORLD_GAMES_LEVEL_PRIZE_ADDRESS =
  '0x0773fbf60182c13b97bd9cb4db52c64c25cbd99f';

export const ERA7_SUMMONED_PLAYING_CARD_ADDRESS =
  '0xa2304fc66299339bd128b123cddb416f3ae99765';

export const ERA7_SIGNED_IN_AT_LEAST_TIMES_ADDRESS =
  '0xc7eddc2eb5362a791e4a78edf6f3cac0ba59f8de';

export const ERA7_BOUGHT_AN_NFT_HERO_ADDRESS =
  '0xb193330e548a36902dfa70ccca406dc3cc28c019';

export const MY_RICH_FARM_LAND_ADDRESS =
  '0x7e78420966cededc28b5ae3463962372160984c1';

export const MY_RICH_FARM_AVATAR_ADDRESS =
  '0x4773a7520b4befdc601a49fcb305868cb9c515f8';

export const MY_RICH_FARM_FUN_ZONE_GAMER_TIMES_ADDRESS =
  '0x617ad5a4aa39df3ec9f6f05c06aea30d885f51c5';

export const META_KEEPER_OWNER_OF_ONE_KEEPER_NFT_ADDRESS =
  '0x778f2cf960d2f68050cbe10c67db7c26d2236fe9';

export const META_KEEPER_KEEPERS_LEVEL_UP_ADDRESS =
  '0x6bdcfca87765d14f36e99943fc5d82c2292f8b5d';

export const FARA_LAND_SUMMONED_DEMI_KNIGHT_ADDRESS =
  '0x11d20864cfe0e8fed15c10658c298572792dad65';

export const FARA_LAND_MOON_KNIGHT_HERO_OWNER_ADDRESS =
  '0xa7a9a8156c24c4b0ca910c3ba842d1f1ac7200ef';

export const FARA_LAND_GACHA_EXPLORER_ADDRESS =
  '0xb6ab38f62814104255d8fc624189a0df62c64882';

export const META_MON_OPEN_BINANCE_NFT_MYSTERY_BOX_RACA_ADDRESS =
  '0xaff8bed9acf05f0306de328c3eed9b8b5a359947';

export const HEROES_AND_EMPIRES_UPGRADED_BREAK_LIMIT_FOR_HERO_ADDRESS =
  '0x34ced8dafc19d0ddb94077026023b68fc117f0bc';

export const BINARY_X_OWNS_CYBER_DRAGON_ITEMS_TIMES_ADDRESS =
  '0x237656feff33c6ba098b6cfb23a5435bd0f50434';

export const CRYPTO_LEGIONS_BLOODSTONE_HUNTS_TIMES_ADDRESS =
  '0x7072c4bb7682ee1002a26f090291389488b26144';

export const THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_1 =
  '0x98eb46cbf76b19824105dfbcfa80ea8ed020c6f4';

export const THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_2 =
  '0x7bf5d1dec7e36d5b4e9097b48a1b9771e6c96aa4';

export const THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_3 =
  '0x54ac76f9afe0764e6a8ed6c4179730e6c768f01c';

export const THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_4 =
  '0x39a4d9815aae1131d41ed22cd2b45de9e75447ca';

export const THETAN_ARENA_RENTED_ONE_NFT_ADDRESS_1 =
  '0x1c4e9f87c7f2bcd80c89a1999d776461d41545b9';

export const THETAN_ARENA_RENTED_ONE_NFT_ADDRESS_2 =
  '0xbd69abdcc8acdafca69c96e10141f573842b40e4';

export const THETAN_ARENA_FUZED_NFT_ADDRESS =
  '0xbcee89332e303c9a18b7a69c994f9f40d6566c73';

export const TINY_WORLD_NFT_ADDRESS =
  '0xa8a10882f9043389b7e0e09bb830bb541a69e3bb';

export const TINY_WORLD_NFT = '0xd80edcf7c73b43852da39497a6b5e9cba1edf39e';

export const TINY_WORLD_NFT_CHECK_IN_ADDRESS =
  '0x96eade4c5ca5251caa7801ed38fada4807f63cbe';

export const METARUN_TICKET_SWAP = '0xf27db2c45e38468bc3e7998d0ac7590e27c1bf3e';
export const METARUN_MYSTERY_BOX_REVEAL =
  '0xa4bd7cfebf6cec614dbc24ca3f290c1868935702';
export const SOLANA_WALKEN_BREEDER =
  '81DTeooGYPrgenBx84faBG2NXvRQnpjjdwDGjL5HpYZn';
export const SOLANA_WALKEN_GAME_1 =
  'A2B1w2fpwuJZrF9b69KBFb6Cn4Cp7siKGqQwPBJEGLYj';
export const SOLANA_WALKEN_GAME_2 =
  '6HyVjAUJu1T2EhojQa2bJ83TJ9dUdsXS3wveWh3XrxBN';

@Injectable()
export class AchievementsOnChainService {
  private readonly logger = new Logger(AchievementsOnChainService.name);

  // Похоже на какой-то костыль, чтобы обойти круговую зависимость
  private readonly userRepository: Repository<User>;
  private readonly gameRepository: Repository<Game>;
  private readonly userAchievementRepository: Repository<UserAchievement>;

  constructor(
    @InjectRepository(AchievementProgress)
    private readonly achievementProgressRepository: Repository<AchievementProgress>,
    @InjectQueue(AchievementProcessorList.HandleOnChain)
    private readonly achievementQueue: Queue,
    @InjectConnection() private readonly connection: Connection,
    private readonly accountTransactionAggregationService: AccountTransferAggregationService,
    private readonly csvParser: CsvParser,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.userRepository = this.connection.getRepository(User);
    this.userAchievementRepository =
      this.connection.getRepository(UserAchievement);
    this.gameRepository = this.connection.getRepository(Game);
  }

  async getAchievementsFromCsv(file: Express.Multer.File): Promise<{
    status: 'started' | 'finished' | 'in progress' | 'failed';
    message?: string;
  }> {
    const cacheKey = 'get-achievements-from-csv';
    const status = await this.cacheManager.get<
      'started' | 'finished' | 'in progress' | 'failed'
    >(cacheKey);

    // const jobs = await this.getJobs();
    // console.log(jobs);
    // if (!jobs.length) {
    //   await this.cacheManager.del(cacheKey);
    // }

    if (status) {
      if (status !== 'in progress') {
        await this.cacheManager.del(cacheKey);
      }

      return { status };
    }

    try {
      class TableEntity {
        wallet: string;
      }

      const stream = fs.createReadStream(file.path);

      const entities = await this.csvParser.parse(
        stream,
        TableEntity,
        null,
        null,
        { headers: false },
      );

      // const wallets = entities.list.map((row: Record<number, string>) =>
      //   Object.values(row)[0].replace(/["',]/g, ''),
      // );

      const data = Helpers.arrayToMatrix(
        entities.list.map((row: Record<number, string>) =>
          Object.values(row)[0].replace(/["',]/g, ''),
        ),
        100,
      );

      const wallets = (
        await Promise.all(
          data.map((row) =>
            this.connection.query(
              `
                SELECT
                  address_from as wallet
                FROM
                  transactions_bsc tb
                  JOIN game_contract gc ON tb.address_to = gc.address
                WHERE
                  address_from IN (${row
                    .map((addr) => `'${addr.toLowerCase()}'`)
                    .join(',')})
                  GROUP BY wallet;
              `,
            ),
          ),
        )
      ).flat();

      const users = wallets.map(({ wallet }) =>
        this.userRepository.create({
          walletAddress: wallet,
          wallets: [],
          achievements: [],
        }),
      );

      const games = await this.gameRepository.find({
        where: {
          is_on_chain: true,
          in_use: true,
        },
        relations: ['achievements'],
      });

      users.forEach((user, index) =>
        this.achievementQueue.add(
          AchievementQueueList.HandleCsv,
          {
            games,
            user,
            current: index,
            total: users.length,
          },
          {
            delay: index * 150,
            attempts: 1,
            removeOnFail: true,
            removeOnComplete: true,
          },
        ),
      );

      await this.cacheManager.set(cacheKey, 'started');

      return { status: 'started' };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return { status: 'failed', message: 'Please start request again' };
    }
  }

  async handleAchievements(
    gameId: Game['id'],
    userId: User['id'],
    saveResults = true,
  ): Promise<Record<number, boolean>[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['achievements', 'achievements.achievement', 'wallets'],
    });

    if (!user) {
      throw new Error(`Can not find user by user id: ${userId}`);
    }

    const userAchievementIds = user.achievements.map(
      ({ achievement: { id } }) => id,
    );

    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['achievements'],
    });

    if (!game) {
      throw new Error(`Can not find game id: ${gameId}`);
    }

    const { achievements } = game;

    return Promise.all(
      achievements
        .filter(({ id }) => !userAchievementIds.includes(id))
        .map((achievement) =>
          this.handleAchievementRules(
            game.id,
            achievement,
            user,
            saveResults,
          ).then((res) => ({ [achievement.id]: res })),
        ),
    ).catch((err) => {
      this.logger.error(new Error(err));

      throw err;
    });
  }

  async startProcessing(userId: User['id']): Promise<void> {
    this.logger.log('Achievement handler start.');

    let progress = await this.achievementProgressRepository.findOne({
      userId,
    });

    if (progress && progress.status === AchievementProgressStatus.WAITING) {
      this.logger.warn('Achievement handler processing already started.');

      return;
    }

    const MATRIX_STEP = 1;

    const games = await this.gameRepository.find({
      select: ['id'],
      where: {
        is_on_chain: true,
        in_use: true,
      },
    });

    if (!progress) {
      progress = this.achievementProgressRepository.create({
        userId,
        startedAt: new Date(),
        finishedAt: new Date(),
      });
    }

    await this.achievementProgressRepository.save({
      ...progress,
      startedAt: new Date(),
      status: AchievementProgressStatus.WAITING,
    });

    const gameIds = games.map(({ id }) => id);
    const matrixGameIds = Helpers.arrayToMatrix(gameIds, MATRIX_STEP);

    try {
      matrixGameIds.map((ids, index) =>
        this.achievementQueue.add(
          AchievementQueueList.HandleOnChain,
          {
            gameIds: ids,
            userId,
            current: index,
            total: matrixGameIds.length,
          },
          {
            delay: index * 250,
            attempts: 1,
            removeOnFail: true,
            removeOnComplete: true,
          },
        ),
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  async stopProcessing(): Promise<void> {
    const [progressItems, jobs] = await Promise.all([
      this.achievementProgressRepository.find({
        status: AchievementProgressStatus.WAITING,
      }),
      this.getJobs(),
    ]);

    await Promise.allSettled(jobs.map((j) => j.remove())).catch((err) => {
      this.logger.log(new Error(err));

      throw err;
    });

    await Promise.all(
      progressItems.map((progress) =>
        this.achievementProgressRepository.save({
          ...progress,
          status: AchievementProgressStatus.STOPPED,
        }),
      ),
    );
  }

  async getAchievementProgressList(): Promise<AchievementProgress[]> {
    const progressList = await this.achievementProgressRepository.find();

    if (!progressList.length) {
      return [];
    }

    return progressList;
  }

  async getAchievementProgress(userId: number): Promise<AchievementProgress> {
    const progress = await this.achievementProgressRepository.findOne({
      userId,
    });

    if (!progress) {
      throw new NotFoundException(
        'Achievement handler progress not found for this user',
      );
    }

    return progress;
  }

  async statusProcessing(
    payload: Partial<AchievementProcessingDto>,
  ): Promise<boolean> {
    if (payload && payload.userId) {
      const processing = await this.achievementProgressRepository.findOne({
        userId: payload.userId,
        status: AchievementProgressStatus.WAITING,
      });

      return !!processing;
    }

    const jobs = await this.achievementQueue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
      'failed',
      'paused',
    ]);

    return !!jobs.length;
  }

  private async getJobs(): Promise<Bull.Job<any>[]> {
    return this.achievementQueue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
      'failed',
      'paused',
    ]);
  }

  private handleAchievementData(
    data: ResultOfAchievementRule[],
    rule: AchievementRule,
    user: User,
  ): AchievementHandlerData[] {
    return data.reduce((acc, { payload, wallet: walletAddress }) => {
      const wallet = user.wallets.find((i) => i.wallet === walletAddress);

      switch (rule.operand) {
        case AchievementRuleOperand.EQUAL:
          return acc.concat({
            status: payload === Number(rule.value),
            wallet,
            rule,
          });

        case AchievementRuleOperand.GT:
          return acc.concat({
            status: payload > Number(rule.value),
            wallet,
            rule,
          });

        case AchievementRuleOperand.GTE:
          return acc.concat({
            status: payload >= Number(rule.value),
            wallet,
            rule,
          });

        case AchievementRuleOperand.LT:
          return acc.concat({
            status: payload < Number(rule.value),
            wallet,
            rule,
          });

        case AchievementRuleOperand.LTE:
          return acc.concat({
            status: payload <= Number(rule.value),
            wallet,
            rule,
          });

        case AchievementRuleOperand.NOT_EQUAL:
          return acc.concat({
            status: payload === Number(rule.value),
            wallet,
            rule,
          });

        default:
          this.logger.log(
            `Achievement rule operand is unknown: ${rule.operand}`,
          );
          return acc;
      }
    }, []);
  }

  private async handleSpendUSD(dto): Promise<AchievementHandlerData[]> {
    const data =
      await this.accountTransactionAggregationService.getSpendUSDByWallets(
        dto.gameId,
        dto.walletAddresses,
      );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async handleSolanaSpendUSD(dto): Promise<AchievementHandlerData[]> {
    const data =
      await this.accountTransactionAggregationService.getSolanaSpendUSDByWallets(
        dto.gameId,
        dto.walletAddresses,
      );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async handleEarnUSD(dto): Promise<AchievementHandlerData[]> {
    const data =
      await this.accountTransactionAggregationService.getEarnUSDByWallets(
        dto.gameId,
        dto.walletAddresses,
      );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async handleSolanaEarnUSD(dto): Promise<AchievementHandlerData[]> {
    const data =
      await this.accountTransactionAggregationService.getSolanaEarnUSDByWallets(
        dto.gameId,
        dto.walletAddresses,
      );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async handleEarnCoin(
    dto: AchievementHandlerDto,
    tokenAddress: string,
  ): Promise<AchievementHandlerData[]> {
    const data =
      await this.accountTransactionAggregationService.getEarnCoinByWallets(
        dto.gameId,
        dto.walletAddresses,
        tokenAddress,
      );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async handleSolanaEarnCoin(
    dto: AchievementHandlerDto,
    tokenAddress: string,
  ): Promise<AchievementHandlerData[]> {
    const data =
      await this.accountTransactionAggregationService.getSolanaEarnCoinByWallets(
        dto.gameId,
        dto.walletAddresses,
        tokenAddress,
      );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async handleCyballClaimedRewardTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(*) payload, main_address as wallet
        from account_transfer_aggregation
        where main_address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and second_address = '${CYBALL_CLAIMED_REWARD_ADDRESS}'
          and game_id = ${dto.gameId}
        group by main_address
    `;
    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleBreakeven(dto): Promise<AchievementHandlerData[]> {
    const data = await this.accountTransactionAggregationService.getBreakeven(
      dto.gameId,
      dto.walletAddresses,
    );

    return this.handleAchievementData(
      data.map(({ amount, wallet }) => ({
        payload: amount,
        wallet,
      })),
      dto.rule,
      dto.user,
    );
  }

  private async gameInteraction(dto): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
      SELECT COUNT(*)  AS payload,
             uw.wallet AS wallet
      FROM user_wallet uw
             JOIN game_contract gc ON gc.game_id = ${dto.gameId}
             JOIN transactions_bsc tb ON uw.wallet = tb.address_from AND gc.address = tb.address_to
      WHERE uw."userId" = ${dto.user.id}
      GROUP BY uw.wallet
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleCyballGaveOutNftToRent(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and a2.address in (${CYBALL_GAVE_OUT_NFT_TO_RENT_ADDRESSES.map(
            (addr) => `'${addr}'`,
          ).join(',')})
          and at2.game_id = ${dto.gameId}
--           TODO: token_contract = cyblock address id
          and at2.token_id is not null
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleCyballMadeAMentoring(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and at2.transaction_contract = '${CYBALL_MADE_A_MENTORING_ADDRESS}'
          and at2.game_id = ${dto.gameId}
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleStarSharkUpgradeYourShark(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = 'cee8607b'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and at2.transaction_contract = '${STAR_SHARK_UPGRADE_YOUR_SHARK_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleStarSharkMintNft(dto): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc on at2.token_contract_id = tc.id
        where at2.game_id = ${dto.gameId}
          and a2.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and tc.address = '${STAR_SHARK_NFT_ADDRESS}'
          and a.address in ('${BASE_BURN_ADDRESS_1}', '${BASE_BURN_ADDRESS_2}', '${BASE_BURN_ADDRESS_3}')
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetaverseMinersNftOwn(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.to_account_id = a.id
                 left join token_contract tc on at2.token_contract_id = tc.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and tc.address = '${METAVERS_MINERS_NFT_ADDRESS}'
          and at2.game_id = ${dto.gameId}
          and at2.token_id is not null
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetaverseMinersRechargeEnergyTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(*) payload, main_address as wallet
        from account_transfer_aggregation
        where main_address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and method = 'ef299b0b'
          and transaction_contract = '${METAVERS_MINERS_RECHARGE_ENERGY_TIMES_ADDRESS}'
          and game_id = ${dto.gameId}
        group by main_address
    `;
    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleXWorldGamesMintNft(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc on at2.token_contract_id = tc.id
        where a2.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and a.address in ('${BASE_BURN_ADDRESS_1}', '${BASE_BURN_ADDRESS_2}', '${BASE_BURN_ADDRESS_3}')
          and at2.game_id = ${dto.gameId}
          and tc.address = '${XWORLD_NFT_ADDRESS}'
        group by at2.transaction_hash, a2.address
    `;
    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleXWorldGamesLevelPrize(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = '2a757bc5'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and at2.transaction_contract = '${X_WORLD_GAMES_LEVEL_PRIZE_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;
    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleEra7SummonedPlayingCard(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = '87481f80'
          and a2.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and at2.transaction_contract = '${ERA7_SUMMONED_PLAYING_CARD_ADDRESS}'
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleEra7SignedInAtLeastTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        SELECT count(DISTINCT tb.tx_hash) AS payload,
               tb.address_from            AS wallet
        FROM transactions_bsc tb
        WHERE tb.address_from IN (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          AND tb.address_to = '${ERA7_SIGNED_IN_AT_LEAST_TIMES_ADDRESS}'
          AND tb.input = '9e4cda43'
        GROUP BY tb.address_from;
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleEra7BoughtAnNFTHero(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.to_account_id = a.id
                 left join token_contract tc on at2.token_contract_id = tc.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and tc.address = '${ERA7_BOUGHT_AN_NFT_HERO_ADDRESS}'
          and at2.game_id = ${dto.gameId}
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMyRichFarmLandOwner(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc ON at2.token_contract_id = tc.id
        where a2.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and tc.address = '${MY_RICH_FARM_LAND_ADDRESS}'
          and at2.game_id = ${dto.gameId}
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMyRichFarmAvatarOwner(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc ON at2.token_contract_id = tc.id
        where a2.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and tc.address = '${MY_RICH_FARM_AVATAR_ADDRESS}'
          and at2.game_id = ${dto.gameId}
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMyRichFarmFunZoneGamerTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = 'f118b860'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and a2.address = '${MY_RICH_FARM_FUN_ZONE_GAMER_TIMES_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetaKeeperOwnerOfOneKeeperNft(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc ON at2.token_contract_id = tc.id
        where a2.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and tc.address = '${META_KEEPER_OWNER_OF_ONE_KEEPER_NFT_ADDRESS}'
          and at2.game_id = ${dto.gameId}
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetaKeeperKeepersLevelUp(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        SELECT count(DISTINCT tb.tx_hash) AS payload,
               tb.address_from            AS wallet
        FROM transactions_bsc tb
        WHERE tb.address_from IN (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          AND tb.address_to = '${META_KEEPER_KEEPERS_LEVEL_UP_ADDRESS}'
          AND tb.input = '21a83847'
        GROUP BY tb.address_from;
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleFaralandSummonedDemiKnight(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = '27583199'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and a2.address = '${FARA_LAND_SUMMONED_DEMI_KNIGHT_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleFaralandMoonKnightHeroOwner(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = 'd96a094a'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and a2.address = '${FARA_LAND_MOON_KNIGHT_HERO_OWNER_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleFaralandGachaExplorer(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = 'c06b91a3'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and a2.address = '${FARA_LAND_GACHA_EXPLORER_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetamonOpenBinanceNftMysteryBoxRACA(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and a2.address = '${META_MON_OPEN_BINANCE_NFT_MYSTERY_BOX_RACA_ADDRESS}'
          and at2.game_id = ${dto.gameId}
          and at2.token_id is not null
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleTheCryptYouMintedBitcoinHolderNFT(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and a2.address = '${BASE_BURN_ADDRESS_1}'
          and at2.game_id = ${dto.gameId}
          and at2.token_id is not null
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleHeroesAndEmpiresMintedHEANFT(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and a2.address = '${BASE_BURN_ADDRESS_1}'
          and at2.game_id = ${dto.gameId}
          and at2.token_id is not null
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleHeroesAndEmpiresUpgradedBreakLimitForHero(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where at2.game_id = ${dto.gameId}
          and at2."method" = '97315874'
          and a.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and a2.address =
              '${HEROES_AND_EMPIRES_UPGRADED_BREAK_LIMIT_FOR_HERO_ADDRESS}'
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleBinaryXOwnsCyberDragonTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a.address                   as wallet
        from account_transfer at2
                 join account a on at2.from_account_id = a.id
                 join account a2 on at2.to_account_id = a2.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and a2.address = '${BINARY_X_OWNS_CYBER_DRAGON_ITEMS_TIMES_ADDRESS}'
          and at2.game_id = ${dto.gameId}
          and at2.token_id is not null
        group by at2.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleCryptoLegionsBloodstoneHuntsTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(acc_trans.transaction_hash) as payload,
               from_account.address              as wallet
        from account_transfer acc_trans
                 join account from_account on acc_trans.from_account_id = from_account.id
                 join account to_account on acc_trans.to_account_id = to_account.id
        where acc_trans.game_id = ${dto.gameId}
            and acc_trans."method" = 'c7c371d8'
           or acc_trans."method" = '613a6999'
            and from_account.address in (${dto.walletAddresses
              .map((addr) => `'${addr}'`)
              .join(',')}) and
              to_account.address =
              '${CRYPTO_LEGIONS_BLOODSTONE_HUNTS_TIMES_ADDRESS}'
        group by acc_trans.transaction_hash, from_account.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleThetanArenaBoughtThetanNTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc on at2.token_contract_id = tc.id
        where a2.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and ((at2.transaction_contract = '${THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_4}' AND method = '59a87bc1') OR
               (at2.transaction_contract = '${THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_2}' AND method = 'e8e8e872') OR
               (at2.transaction_contract = '${THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_3}' AND method = 'e8e8e872')
            )
          and at2.game_id = ${dto.gameId}
          and tc.address = '${THETAN_ARENA_BOUGHT_THETAN_N_TIMES_ADDRESS_1}'
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleThetanArenaRentedOneNFT(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(acc_trans.transaction_hash) as payload,
               from_account.address              as wallet
        from account_transfer acc_trans
                 join account from_account on acc_trans.from_account_id = from_account.id
        where from_account.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and ((acc_trans.transaction_contract = '${THETAN_ARENA_RENTED_ONE_NFT_ADDRESS_1}' AND method = '81ef0dcd') OR
               (acc_trans.transaction_contract = '${THETAN_ARENA_RENTED_ONE_NFT_ADDRESS_2}' AND method = 'd20c0913'))
          and acc_trans.game_id = ${dto.gameId}
          and acc_trans.token_id is null
        group by acc_trans.transaction_hash, from_account.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleThetanArenaFuzedOneNFT(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(acc_trans.transaction_hash) as payload,
               from_account.address              as wallet
        from account_transfer acc_trans
                 join account from_account on acc_trans.from_account_id = from_account.id
                 join account to_account on acc_trans.to_account_id = to_account.id
        where acc_trans.game_id = ${dto.gameId}
          and acc_trans."method" = '2dbf094b'
          and from_account.address in (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
          and to_account.address = '${THETAN_ARENA_FUZED_NFT_ADDRESS}'
        group by acc_trans.transaction_hash, from_account.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleTinyWorldBurnNftTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(acc_trans.transaction_hash) as payload,
               a.address                         as wallet
        from account_transfer acc_trans
                 join account a on acc_trans.from_account_id = a.id
                 join account a2 on acc_trans.to_account_id = a2.id
        where a.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and acc_trans.transaction_contract = '${TINY_WORLD_NFT_ADDRESS}'
          and a2.address IN ('${BASE_BURN_ADDRESS_1}', '${BASE_BURN_ADDRESS_2}', '${BASE_BURN_ADDRESS_3}')
          and acc_trans.game_id = ${dto.gameId}
          and acc_trans.token_id is not null
        group by acc_trans.transaction_hash, a.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleTinyWorldNftStakingMaster(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        select count(at2.transaction_hash) as payload,
               a2.address                  as wallet
        from account_transfer at2
                 join account a2 on at2.to_account_id = a2.id
                 left join token_contract tc on at2.token_contract_id = tc.id
        where a2.address in (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          and tc.address = '${TINY_WORLD_NFT}'
          and at2.game_id = ${dto.gameId}
          and at2.token_id is not null
        group by at2.transaction_hash, a2.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleTinyWorldNftCheckInTimes(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        SELECT count(DISTINCT tb.tx_hash) AS payload,
               tb.address_from            AS wallet
        FROM transactions_bsc tb
        WHERE tb.address_from IN (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          AND tb.address_to = '${TINY_WORLD_NFT_CHECK_IN_ADDRESS}'
          AND tb.input = 'baeb0718'
        GROUP BY tb.address_from;
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetarunTicketSwap(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
      SELECT count(DISTINCT tb.tx_hash) AS payload,
             tb.address_from            AS wallet
      FROM transactions_bsc tb
      WHERE tb.address_from IN (${dto.walletAddresses
        .map((addr) => `'${addr}'`)
        .join(',')})
        AND tb.address_to = '${METARUN_TICKET_SWAP}'
      GROUP BY tb.address_from;
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleMetarunMysteryReveal(
    dto,
  ): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
        SELECT count(DISTINCT tb.tx_hash) AS payload,
               tb.address_from            AS wallet
        FROM transactions_bsc tb
        WHERE tb.address_from IN (${dto.walletAddresses
          .map((addr) => `'${addr}'`)
          .join(',')})
          AND tb.address_to = '${METARUN_MYSTERY_BOX_REVEAL}'
          AND tb.input = 'cf081329'
        GROUP BY tb.address_from;
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleWalkenBreeder(dto): Promise<AchievementHandlerData[]> {
    // language=PostgreSQL
    const query = `
      SELECT COUNT(*) AS payload, main_address AS wallet
      FROM solana_account_transfer_aggregation
      WHERE main_address IN (${dto.walletAddresses
        .map((addr) => `'${addr}'`)
        .join(',')})
        AND second_address = '${SOLANA_WALKEN_BREEDER}'
        AND transfer_type = 'SPEND'
        AND nft_parent_id IS NULL
      GROUP BY main_address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleWalkenNftCollector(dto) {
    // language=PostgreSQL
    const query = `
      SELECT count(snt.*) AS payload, sa.address AS wallet
      FROM solana_nft_transfer snt
             JOIN solana_account sa on snt.to_account_id = sa.id AND sa.address IN (${dto.walletAddresses
               .map((addr) => `'${addr}'`)
               .join(',')})
      WHERE snt.buyer_amount != 0
        AND snt.seller_amount != 0
      GROUP BY sa.address
    `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  private async handleWalkenGamer(dto) {
    // language=PostgreSQL
    const query = `
          SELECT COUNT(*) AS payload, main_address AS wallet
          FROM solana_account_transfer_aggregation
          WHERE main_address IN (${dto.walletAddresses
            .map((addr) => `'${addr}'`)
            .join(',')})
            AND second_account_id IN (SELECT id
                                      FROM solana_account
                                      WHERE address IN ('${SOLANA_WALKEN_BREEDER}', '${SOLANA_WALKEN_GAME_1}',
                                                        '${SOLANA_WALKEN_GAME_2}'))
          GROUP BY main_address;
      `;

    const dataList = await this.connection.query(query);

    return this.handleAchievementData(dataList, dto.rule, dto.user);
  }

  async handleAchievementRules(
    gameId: Game['id'],
    achievement: Achievement,
    user: User,
    saveResults = true,
  ): Promise<boolean> {
    const walletAddresses = Array.from(
      new Set(
        user.wallets.map(({ wallet }) => wallet).concat(user.walletAddress),
      ),
    );

    const handledRules = await Promise.all(
      achievement.rules.reduce((acc, rule, index) => {
        const ruleExtended: AchievementRuleExtended = { ...rule, id: index };

        const dto = new AchievementHandlerDto({
          gameId,
          rule: ruleExtended,
          user,
          walletAddresses,
        });

        switch (rule.handler) {
          // <Base>
          case AchievementRuleHandler.EARN_USD:
            return acc.concat(this.handleEarnUSD(dto));

          case AchievementRuleHandler.SOLANA_EARN_USD:
            return acc.concat(this.handleSolanaEarnUSD(dto));

          case AchievementRuleHandler.EARN_META: {
            const coinAddress = '0x04073d16c6a08c27e8bbebe262ea4d1c6fa4c772';
            return acc.concat(this.handleEarnCoin(dto, coinAddress));
          }
          case AchievementRuleHandler.EARN_CBT: {
            const coinAddress = '0x7c73967dc8c804ea028247f5a953052f0cd5fd58';
            return acc.concat(this.handleEarnCoin(dto, coinAddress));
          }
          case AchievementRuleHandler.EARN_MRUN: {
            const coinAddress = '0xca0d640a401406f3405b4c252a5d0c4d17f38ebb';
            return acc.concat(this.handleEarnCoin(dto, coinAddress));
          }
          case AchievementRuleHandler.SOLANA_EARN_WLKN: {
            const coinAddress = 'ecqcuyv57c4v6ropxkvuidwtx1sp8y8fp5aetoyl8az';
            return acc.concat(this.handleSolanaEarnCoin(dto, coinAddress));
          }

          case AchievementRuleHandler.SPEND_USD:
            return acc.concat(this.handleSpendUSD(dto));

          case AchievementRuleHandler.SOLANA_SPEND_USD:
            return acc.concat(this.handleSolanaSpendUSD(dto));

          case AchievementRuleHandler.BREAKEVEN:
            return acc.concat(this.handleBreakeven(dto));

          case AchievementRuleHandler.GAME_INTERACTION:
            return acc.concat(this.gameInteraction(dto));
          // </Base>

          // <Cyball>
          case AchievementRuleHandler.CYBALL_CLAIMED_REWARD_TIMES:
            return acc.concat(this.handleCyballClaimedRewardTimes(dto));

          case AchievementRuleHandler.CYBALL_GAVE_OUT_NFT_TO_RENT:
            return acc.concat(this.handleCyballGaveOutNftToRent(dto));

          case AchievementRuleHandler.CYBALL_MADE_A_MENTORING:
            return acc.concat(this.handleCyballMadeAMentoring(dto));
          // </Cyball>

          // <Star Shark>
          case AchievementRuleHandler.STAR_SHARK_UPGRADE_YOUR_SHARK:
            return acc.concat(this.handleStarSharkUpgradeYourShark(dto));

          case AchievementRuleHandler.STAR_SHARK_MINT_NFT:
            return acc.concat(this.handleStarSharkMintNft(dto));
          // </ Star Shark>

          // <Metavers Miners>
          case AchievementRuleHandler.METAVERS_MINERS_MINT_NFT:
            return acc.concat(this.handleMetaverseMinersNftOwn(dto));

          case AchievementRuleHandler.METAVERS_MINERS_RECHARGE_ENERGY_TIMES:
            return acc.concat(
              this.handleMetaverseMinersRechargeEnergyTimes(dto),
            );
          // </Metavers Miners>

          // <X World Games>
          case AchievementRuleHandler.X_WORLD_GAMES_MINT_NFT:
            return acc.concat(this.handleXWorldGamesMintNft(dto));

          case AchievementRuleHandler.X_WORLD_GAMES_LEVEL_PRIZE:
            return acc.concat(this.handleXWorldGamesLevelPrize(dto));
          // </X World Games>

          // <Era 7>
          case AchievementRuleHandler.ERA7_SUMMONED_PLAYING_CARD:
            return acc.concat(this.handleEra7SummonedPlayingCard(dto));

          case AchievementRuleHandler.ERA7_SIGNED_IN_AT_LEAST_TIMES:
            return acc.concat(this.handleEra7SignedInAtLeastTimes(dto));

          case AchievementRuleHandler.ERA7_BOUGHT_AN_NFT_HERO:
            return acc.concat(this.handleEra7BoughtAnNFTHero(dto));
          // </Era 7>

          // <My Rich Farm>
          case AchievementRuleHandler.MY_RICH_FARM_AVATAR_OWNER:
            return acc.concat(this.handleMyRichFarmAvatarOwner(dto));

          case AchievementRuleHandler.MY_RICH_FARM_FUN_ZONE_GAMER_TIMES:
            return acc.concat(this.handleMyRichFarmFunZoneGamerTimes(dto));

          case AchievementRuleHandler.MY_RICH_FARM_LAND_OWNER:
            return acc.concat(this.handleMyRichFarmLandOwner(dto));
          // </My Rich Farm>

          // <Meta Keeper>
          case AchievementRuleHandler.META_KEEPER_OWNER_OF_ONE_KEEPER_NFT:
            return acc.concat(this.handleMetaKeeperOwnerOfOneKeeperNft(dto));

          case AchievementRuleHandler.META_KEEPER_KEEPERS_LEVEL_UP:
            return acc.concat(this.handleMetaKeeperKeepersLevelUp(dto));
          // </Meta Keeper>

          // <Faraland>
          case AchievementRuleHandler.FARA_LAND_SUMMONED_DEMI_KNIGHT:
            return acc.concat(this.handleFaralandSummonedDemiKnight(dto));

          case AchievementRuleHandler.FARA_LAND_MOON_KNIGHT_HERO_OWNER:
            return acc.concat(this.handleFaralandMoonKnightHeroOwner(dto));

          case AchievementRuleHandler.FARA_LAND_GACHA_EXPLORER:
            return acc.concat(this.handleFaralandGachaExplorer(dto));
          // </Faraland>

          // <Metamon>
          case AchievementRuleHandler.META_MON_OPEN_BINANCE_NFT_MYSTERY_BOX_RACA:
            return acc.concat(
              this.handleMetamonOpenBinanceNftMysteryBoxRACA(dto),
            );
          // </Metamon>

          // <The Crypto You>
          case AchievementRuleHandler.THE_CRYPTO_YOU_MINTED_BITCOIN_HOLDER_NFT:
            return acc.concat(
              this.handleTheCryptYouMintedBitcoinHolderNFT(dto),
            );
          // </The Crypto You>

          // <Heroes And Empires>
          case AchievementRuleHandler.HEROES_AND_EMPIRES_MINTED_HEA_NFT:
            return acc.concat(this.handleHeroesAndEmpiresMintedHEANFT(dto));

          case AchievementRuleHandler.HEROES_AND_EMPIRES_UPGRADED_BREAK_LIMIT_FOR_HERO:
            return acc.concat(
              this.handleHeroesAndEmpiresUpgradedBreakLimitForHero(dto),
            );
          // </Heroes And Empires>

          // <Binary X>
          case AchievementRuleHandler.BINARY_X_OWNS_CYBER_DRAGON_ITEMS_TIMES:
            return acc.concat(this.handleBinaryXOwnsCyberDragonTimes(dto));
          // </Binary X>

          // <Crypto Legions Bloodstone>
          case AchievementRuleHandler.CRYPTO_LEGIONS_BLOODSTONE_HUNTS_TIMES:
            return acc.concat(
              this.handleCryptoLegionsBloodstoneHuntsTimes(dto),
            );
          // </Crypto Legions Bloodstone>

          // <Thetan Arena>
          case AchievementRuleHandler.THETAN_ARENA_BOUGHT_THETAN_N_TIMES:
            return acc.concat(this.handleThetanArenaBoughtThetanNTimes(dto));

          case AchievementRuleHandler.THETAN_ARENA_RENTED_ONE_NFT:
            return acc.concat(this.handleThetanArenaRentedOneNFT(dto));

          case AchievementRuleHandler.THETAN_ARENA_FUZED_NFT:
            return acc.concat(this.handleThetanArenaFuzedOneNFT(dto));
          // </Thetan Arena>

          // <Tiny World>
          case AchievementRuleHandler.TINY_WORLD_BURN_NFT_TIMES:
            return acc.concat(this.handleTinyWorldBurnNftTimes(dto));

          case AchievementRuleHandler.TINY_WORLD_NFT_STAKING_MASTER:
            return acc.concat(this.handleTinyWorldNftStakingMaster(dto));

          case AchievementRuleHandler.TINY_WORLD_NFT_CHECKED_TIMES:
            return acc.concat(this.handleTinyWorldNftCheckInTimes(dto));
          // </Tiny World>

          // <Metarun>
          case AchievementRuleHandler.METARUN_TICKET_SWAP:
            return acc.concat(this.handleMetarunTicketSwap(dto));

          case AchievementRuleHandler.METARUN_MYSTERY_BOX_REVEAL:
            return acc.concat(this.handleMetarunMysteryReveal(dto));
          // </Metarun>

          // <Walken>
          case AchievementRuleHandler.SOLANA_WALKEN_BREEDER:
            return acc.concat(this.handleWalkenBreeder(dto));

          case AchievementRuleHandler.SOLANA_WALKEN_NFT_COLLECTOR:
            return acc.concat(this.handleWalkenNftCollector(dto));

          case AchievementRuleHandler.SOLANA_WALKEN_GAMER:
            return acc.concat(this.handleWalkenGamer(dto));
          // </Walken>

          default:
            this.logger.warn(
              `Unknown achievement rule handler: ${rule.handler} for game id: ${gameId}`,
            );
            return acc;
        }
      }, []),
    );

    const doneRules = handledRules
      .flat()
      .reduce(
        (acc, curr) =>
          curr.status && !acc.find(({ rule }) => rule.id === curr.rule.id)
            ? acc.concat(curr)
            : acc,
        [],
      );

    const isAchievementDone = achievement.rules.length === doneRules.length;

    if (isAchievementDone && saveResults) {
      await Promise.all(
        doneRules.map(({ wallet }) =>
          this.userAchievementRepository.save(
            this.userAchievementRepository.create({
              user,
              achievement,
              wallet,
            }),
          ),
        ),
      ).catch((err) => {
        const error = new Error(err.message);
        this.logger.error(error.stack);

        throw err;
      });
    }

    return isAchievementDone;
  }
}
