import { ethers } from 'ethers';
import * as moment from 'moment';
import { UserSocials } from './enums/user-socials.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  FindCondition,
  FindConditions,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { UserSocialProfile } from './interfaces/user-social-profile.interface';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ClaimAchievementDto } from 'src/users/dto/claim-achievement.dto';
import { AddAchievementDto } from 'src/users/dto/add-achievement.dto';
import { PlayerStatsService } from 'src/player-stats/player-stats.service';
import { AchievementRuleOperand } from 'src/achievements/enums/achievement-rule-operand.enum';
import { AchievementsService } from 'src/achievements/achievements.service';
import { GamesService } from 'src/games/games.service';
import { GameCode } from 'src/games/entities/game.entity';
import { plainToInstance } from 'class-transformer';
import { UserSubscriptionDto } from './dto/user-subscription.dto';
import { VerifyUserSignDto } from './dto/verify-user-sign.dto';
import * as Moralis from 'moralis/node';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserWallet } from './entities/user-wallet.entity';
import { VerifyUserSubscriptionDto } from './dto/verify-user-subscripiton.dto';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserSharingSubscription } from './entities/user-sharing-subscription.entity';
import { Helpers } from 'src/helpers';
import { UserMintedAchievement } from './entities/user-minted-achievement.entity';
import { UserBalanceRecord } from './entities/user-balance-record.entity';
import { UserBalanceDto } from './dto/user-balance.dto';
import { BlockchainEnum } from './enums/blockchain.enum';
import { SolanaWalletService } from './services/solana-wallet.service';
import { v4 as uuidv4 } from 'uuid';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { GameProvider } from 'src/games/enums/game-provider.enum';

const DISCORD_BOT_URL = 'http://178.62.251.186:2300';
// Токен для запросов к дискорд боту
const DISCORD_BOT_TOKEN =
  'KuhYB3eR1pHitBI0Shyq8m9mw3TyOAQ6WSXjT095fy6ymyZrQsIuJZ9w0yIgTs4Lx3UXACJtrw9KZEhLCydtlIlRsacEGWpw03wHWVYqYcP58bhbzaSEI7Bb9dUbgFFI';
// Роль, которую получает пользователь при успешной подписке
const DISCORD_ROLE_ID = '994141549040513054';

// Кошелек, на который приходят оплаты подписки
const SUBSCRIPTION_WALLET = '0xfBC3ABc40Cd4Ec92F7495a94319d4F1f4F569128';
// Стоимость подписки за период
const SUBSCRIPTION_MONTH_COST = 0.05;
const SUBSCRIPTION_QUARTER_COST = 0.15;
const SUBSCRIPTION_YEAR_COST = 0.5;

const MORALIS_SERVER_URL = 'https://miew7r9abdu8.usemoralis.com:2053/server';
const MORALIS_APP_ID = 'Laf0GviIrlnBIlpeYnpjfnWoozEXNGZ9qQwF3Eog';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserWallet)
    private userWalletRepository: Repository<UserWallet>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(UserSharingSubscription)
    private userSharingRepository: Repository<UserSharingSubscription>,
    @InjectRepository(UserMintedAchievement)
    private userMintedAchievementRepository: Repository<UserMintedAchievement>,
    @InjectRepository(UserBalanceRecord)
    private userBalanceRepository: Repository<UserBalanceRecord>,
    private playerStatsService: PlayerStatsService,
    private achievementsService: AchievementsService,
    private readonly gamesService: GamesService,
    private readonly httpService: HttpService,
    private readonly solanaWalletService: SolanaWalletService,
  ) {}

  async getUserAchievements(
    userId: User['id'],
    relations?: string[],
  ): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      where: { user: { id: userId } },
      ...(relations && { relations }),
    });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string, relations: string[] = []): Promise<User> {
    const user = await this.usersRepository.findOne(id, {
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIds(
    ids: string[],
    relations: string[] = [],
    limit?: number,
    offset?: number,
  ): Promise<User[]> {
    const options: any = { relations };

    if (limit) {
      options.take = limit;
    }

    if (offset) {
      options.skip = offset;
    }

    const users = await this.usersRepository.findByIds(ids, options);

    if (!users) {
      throw new NotFoundException('Users not found');
    }

    return users;
  }

  async findWallet(
    walletAddress: string,
    is_verified?: boolean,
  ): Promise<UserWallet> {
    const filter: FindCondition<UserWallet> = {
      wallet: walletAddress,
    };

    if (is_verified) {
      filter.is_verified = is_verified;
    }

    const wallet = await this.userWalletRepository.findOne({
      where: filter,
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async findWalletList(
    filter: FindCondition<UserWallet>,
    relations?: string[],
  ): Promise<UserWallet[]> {
    const wallets = await this.userWalletRepository.find({
      where: filter,
      relations,
    });

    if (!wallets.length) {
      return [];
    }

    return wallets;
  }

  async findByWalletAddress(
    walletAddress: string,
    relations?: string[],
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findBySolanaAccount(
    solanaAccount: string,
    relations?: string[],
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { solanaAccount },
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOne(filter: FindConditions<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: filter });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserSubscriptionInfo(
    wallet: string,
    to_address?: string,
  ): Promise<UserSubscriptionDto> {
    let user: User = await this.findOne({
      walletAddress: wallet.toLocaleLowerCase(),
    }).catch(() => null);

    if (!user) {
      user = await this.create({ walletAddress: wallet });
    }

    const moralis = Moralis as any;

    moralis.start({
      serverUrl: MORALIS_SERVER_URL,
      appId: MORALIS_APP_ID,
    });

    const transactions = await moralis.Web3API.account.getTransactions({
      chain: 'eth',
      address: to_address || SUBSCRIPTION_WALLET,
    });

    const payments = transactions.result
      .filter((el) => el.from_address === user.walletAddress)
      .map((el) => ({
        amount: parseInt(el.value, 10) / 10 ** 18,
        createdAt: el.block_timestamp,
      }))
      .filter((el) => el.amount >= SUBSCRIPTION_MONTH_COST)
      .reverse();

    const calcSubscription = (amount: number) => {
      if (amount >= SUBSCRIPTION_YEAR_COST) {
        const years = Math.trunc(amount / SUBSCRIPTION_YEAR_COST);
        const balance = amount - years * SUBSCRIPTION_YEAR_COST;

        return calcSubscription(balance) + years * 365;
      } else if (amount >= SUBSCRIPTION_QUARTER_COST) {
        const quarters = Math.trunc(amount / SUBSCRIPTION_QUARTER_COST);
        const balance = amount - quarters * SUBSCRIPTION_QUARTER_COST;

        return calcSubscription(balance) + quarters * 90;
      } else if (amount >= SUBSCRIPTION_MONTH_COST) {
        const months = Math.trunc(amount / SUBSCRIPTION_MONTH_COST);

        return months * 30;
      } else {
        return 0;
      }
    };

    const currentDate = moment();

    const availableDays = payments.reduce((result, payment) => {
      const { amount, createdAt } = payment;
      const startDate = moment(createdAt);
      const diff = currentDate.diff(startDate, 'days');
      const days = calcSubscription(amount);

      return result + days - diff;
    }, null);

    let subscriptionEndAt = null;

    if (availableDays > 0) {
      currentDate.add(availableDays, 'days');
      subscriptionEndAt = moment(currentDate).format('MMMM DD, YYYY');

      if (user.discord?.id) {
        await firstValueFrom(
          this.httpService.post(
            `${DISCORD_BOT_URL}/add-role`,
            {
              userId: user.discord.id,
              roleId: DISCORD_ROLE_ID,
            },
            { headers: { 'access-token': DISCORD_BOT_TOKEN } },
          ),
        ).catch(() => null);
      }
    }

    const data = {
      id: user.id,
      wallet: user.walletAddress,
      discordId: user.discord?.id || null,
      subscriptionEndAt,
    };

    return plainToInstance(UserSubscriptionDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async createNonce(user: User): Promise<string> {
    const nonce = uuidv4();

    try {
      await this.update(String(user.id), { nonce });
    } catch (e) {
      throw new InternalServerErrorException(
        `Cann't create nonce userId = ${user.id}`,
      );
    }

    return nonce;
  }

  async addSolanaAccount(
    account: string,
    signature: number[],
    user: User,
  ): Promise<boolean> {
    const wallet = await this.userWalletRepository.findOne({
      where: {
        wallet: account,
      },
      relations: ['user'],
    });

    if (!wallet) {
      await this.createWallet(account, false, BlockchainEnum.SOLANA, user);
    }

    const isVerified = await this.verifySolanaAccount(account, signature, user);
    if (!isVerified) {
      return false;
    }

    await this.update(String(user.id), { solanaAccount: account });
    await this.createNonce(user);
    return true;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdBody: Partial<User> = { ...createUserDto };

      if (createUserDto.walletAddress) {
        createdBody.walletAddress = createUserDto.walletAddress.toLowerCase();
      }

      const data = this.usersRepository.create(createdBody);
      const user = await this.usersRepository.save(data);

      if (createUserDto.walletAddress) {
        await this.createWallet(
          createUserDto.walletAddress,
          true,
          BlockchainEnum.EVM,
          user,
        );
      }

      if (
        createUserDto.solanaAccount &&
        this.solanaWalletService.validateAccount(createUserDto.solanaAccount)
      ) {
        await this.createWallet(
          createUserDto.solanaAccount,
          false,
          BlockchainEnum.SOLANA,
          user,
        );
      }

      return user;
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async createWallet(
    walletAddress: string,
    isVerified: boolean,
    blockchainType: BlockchainEnum,
    user: User,
  ): Promise<UserWallet> {
    try {
      const data = this.userWalletRepository.create({
        wallet:
          blockchainType === BlockchainEnum.EVM
            ? walletAddress.toLowerCase()
            : walletAddress,
        is_verified: isVerified,
        blockchainType,
        user,
      });

      return await this.userWalletRepository.save(data);
    } catch (error) {
      throw new BadRequestException('Failed to create user wallet', error);
    }
  }

  async pushUserWalletToSelfTable(): Promise<void> {
    try {
      const users = await this.usersRepository.find({ relations: ['wallets'] });

      const walletQueries = users
        .filter((user) => !!user.walletAddress)
        .filter((user) => !user.wallets.length)
        .map((user) =>
          this.userWalletRepository.create({
            wallet: user.walletAddress,
            is_verified: true,
            user,
          }),
        );

      await this.userWalletRepository.save(walletQueries);
    } catch (error) {
      throw new BadRequestException('Failed to push wallets to self table');
    }
  }

  async verifyUserSign(
    walletAddress: string,
    verifyUserSignDto: VerifyUserSignDto,
  ): Promise<{ status: 'success' | 'fail' }> {
    const { signature, nonce } = verifyUserSignDto;

    const message = `sign_message` + walletAddress + nonce;
    const addr = ethers.utils.verifyMessage(message, signature);

    const result: { status: 'success' | 'fail' } = {
      status: 'fail',
    };

    if (walletAddress === addr.toLowerCase()) {
      result.status = 'success';
    }

    return result;
  }

  async verifyUserSubscription(
    walletAddress: string,
    verifyUserSubscriptionDto: VerifyUserSubscriptionDto,
  ): Promise<{ status: 'success' | 'fail'; data?: UserSubscriptionDto }> {
    const { signature, discordId } = verifyUserSubscriptionDto;

    const result: { status: 'success' | 'fail'; data?: UserSubscriptionDto } =
      await this.verifyUserSign(walletAddress, { signature, nonce: discordId });

    if (result.status === 'success') {
      const [user, data] = await Promise.all([
        this.findByWalletAddress(walletAddress),
        await this.getUserSubscriptionInfo(walletAddress),
      ]);

      result.data = data;

      const userId = discordId || user.discord.id;

      try {
        if (result.data.subscriptionEndAt !== null) {
          await this.grantDiscordRole(userId);
        }

        if (discordId && user.discord?.id !== discordId) {
          await this.update(user.id.toString(), { discord: { id: discordId } });
        }

        result.data.discordId = userId;

        if (user.discord?.id && user.discord?.id !== discordId) {
          await this.removeDiscordRole(user.discord.id);
        }
      } catch (error) {
        throw new BadRequestException(
          'User verify error',
          error?.response?.data?.message || error.message,
        );
      }
    }

    return result;
  }

  async verifyTrialUserSubscription(
    walletAddress: string,
    verifyUserSubscriptionDto: VerifyUserSubscriptionDto,
  ): Promise<{ status: 'success' | 'fail'; data?: UserSubscriptionDto }> {
    const { signature, discordId } = verifyUserSubscriptionDto;

    const result: { status: 'success' | 'fail'; data?: UserSubscriptionDto } =
      await this.verifyUserSign(walletAddress, { signature, nonce: discordId });

    if (result.status === 'success') {
      const date = new Date();
      const wallet = await this.findWallet(walletAddress.toLowerCase());
      const user = wallet.user;
      let subscription = await this.userSharingRepository.findOne({
        where: { user: { id: user.id } },
      });
      const discord = discordId || user.discord.id;

      try {
        if (subscription) {
          if (subscription.expiredAt > date) {
            await this.removeDiscordRole(discord);
            return { status: 'fail' };
          }
        } else {
          subscription = this.userSharingRepository.create({
            user,
            expiredAt: new Date().setDate(date.getDate() + 7),
          });

          this.userSharingRepository.save(subscription);
        }

        if (discordId && user.discord?.id !== discordId) {
          await this.update(user.id.toString(), { discord: { id: discord } });
        }

        await this.grantDiscordRole(discord);

        result.data = {
          id: user.id.toString(),
          wallet: wallet.wallet,
          discordId: discord,
          subscriptionEndAt: subscription.expiredAt,
        };
      } catch (error) {
        throw new BadRequestException(
          'User verify error',
          error?.response?.data?.message || error.message,
        );
      }
    }

    return result;
  }

  async verifyWallet(
    walletAddress: string,
    verifyUserSignDto: VerifyUserSignDto,
    user: User,
  ): Promise<{ status: 'success' | 'fail' }> {
    const wallet = await this.findWallet(walletAddress.toLowerCase());

    if (wallet.user.id !== user.id) {
      throw new BadRequestException("You can't verify someone else's wallet");
    }

    const result = await this.verifyUserSign(wallet.wallet, verifyUserSignDto);

    if (result.status === 'success') {
      wallet.is_verified = true;

      await this.userWalletRepository.save(wallet);
    }

    return result;
  }

  async verifySolanaAccount(
    account: string,
    signature: number[],
    user: User,
  ): Promise<boolean> {
    const wallet = await this.findWallet(account);

    if (wallet.user.id !== user.id) {
      return false;
    }

    const message = UsersService.getMessageForSign(user.nonce);
    if (
      !this.solanaWalletService.verifySignature(account, message, signature)
    ) {
      return false;
    }

    if (wallet) {
      wallet.is_verified = true;

      try {
        await this.userWalletRepository.save(wallet);
        return true;
      } catch (e) {
        throw new BadRequestException("You can't verify wallet");
      }
    }

    return false;
  }

  async connectSocial(
    id: string,
    type: UserSocials,
    profile: UserSocialProfile,
  ): Promise<User> {
    const [user, socialUser] = await Promise.all([
      this.findById(id).catch(() => null),
      this.findOne({ [type]: profile }).catch(() => null),
    ]);

    if (user[type]) {
      throw new BadRequestException(
        `User has already exist ${type} connection`,
      );
    }

    if (socialUser) {
      throw new BadRequestException(`This ${type} account is already in use`);
    }

    try {
      const updateData: { [key: string]: any } = { [type]: profile };

      if (!user.displayedName) {
        updateData.displayedName = profile.name;
      }

      if (!user.email) {
        updateData.email = profile.email;
      }

      await this.usersRepository.update(id, {
        ...updateData,
        updatedAt: new Date(),
      });

      this.checkAchievementsList(user.id.toString()).catch(() => null);

      return this.findById(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async claimNft(
    userId: string,
    claimAchievementDto: ClaimAchievementDto,
  ): Promise<void> {
    const { achievement } = claimAchievementDto;
    const user = await this.findById(userId, [
      'mintedAchievements',
      'achievements',
    ]);

    try {
      const mintedAchievement = this.userMintedAchievementRepository.create({
        achievement,
        user,
      });

      await this.userMintedAchievementRepository.save(mintedAchievement);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addClaimedNfts(userId: string, achievements: number[]): Promise<void> {
    const user = await this.findById(userId, [
      'mintedAchievements',
      'mintedAchievements.achievement',
    ]);

    try {
      const mintedAchievements = achievements
        .filter(
          (el) =>
            !user.mintedAchievements.some(
              ({ achievement }) => Number(el) === achievement.id,
            ),
        )
        .map((achievement) =>
          this.userMintedAchievementRepository.create({
            achievement: { id: achievement },
            user,
          }),
        );

      await this.userMintedAchievementRepository.save(mintedAchievements);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addMintedAchievements(
    achievements: {
      achievement: number;
      wallet: string;
      createdAt: Date;
    }[],
  ): Promise<void> {
    const wallets = achievements
      .map((transaction) => transaction.wallet.toLowerCase())
      .filter((wallet, index, self) => self.indexOf(wallet) === index);

    try {
      const users = await this.usersRepository.find({
        where: { walletAddress: In(wallets) },
        relations: ['mintedAchievements', 'mintedAchievements.achievement'],
      });

      const result = users.map((user) => {
        const mintedAchievements = achievements
          .filter(
            (el) =>
              user.walletAddress === el.wallet.toLowerCase() &&
              !user.mintedAchievements.some(
                ({ achievement }) => Number(el.achievement) === achievement.id,
              ),
          )
          .map((el) =>
            this.userMintedAchievementRepository.create({
              achievement: { id: el.achievement },
              user,
              createdAt: el.createdAt,
            }),
          );

        return mintedAchievements;
      });

      await this.userMintedAchievementRepository.save(result.flat());
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(error);
    }
  }

  async checkAchievementsList(userId: string): Promise<void> {
    this.logger.log('CheckAchievementsList start');

    const games = await this.gamesService.find([
      {
        code: GameCode.FORTNITE,
      },
      { steam_id: Not(IsNull()) },
    ]);

    const gameIds = games.map(({ id }) => id);
    const achievements = await this.achievementsService.getListByGameIds(
      gameIds,
    );

    try {
      const queries = achievements.map((achievement) =>
        this.addAchievement(userId, {
          achievementId: achievement.id.toString(),
        }).catch(() => null),
      );

      await Promise.all(queries);
    } catch (error) {
      throw new BadRequestException(error);
    }

    await this.achievementsService.startProcessing({
      userId: Number(userId),
    });
  }

  async addAchievement(
    id: string,
    addAchievementDto: AddAchievementDto,
  ): Promise<void> {
    const { achievementId } = addAchievementDto;
    const achievement = await this.achievementsService.getById(achievementId, [
      'game',
    ]);
    const user = await this.findById(id, [
      'achievements',
      'achievements.achievement',
      'wallets',
    ]);

    if (user.achievements.some((el) => el.achievement.id === achievement.id)) {
      throw new BadRequestException(
        'User has already unlocked this achievement',
      );
    }

    if (!achievement.rules.length) {
      throw new BadRequestException('Achievement without rules');
    }

    const { result } = await this.playerStatsService.getStats(
      achievement.game.id,
      user,
    );

    const completedRules = achievement.rules.filter(
      ({ key, value, operand }) => {
        const data = Helpers.resolveObjectKeys(key, result);

        if (!data) return false;

        switch (operand) {
          case AchievementRuleOperand.GT:
            return Number(data) > Number(value);

          case AchievementRuleOperand.GTE:
            return Number(data) >= Number(value);

          case AchievementRuleOperand.LT:
            return Number(data) < Number(value);

          case AchievementRuleOperand.LTE:
            return Number(data) <= Number(value);

          case AchievementRuleOperand.NOT_EQUAL:
            return Number(data) !== Number(value);

          default:
            return Number(data) === Number(value);
        }
      },
    );

    if (completedRules.length !== achievement.rules.length) {
      throw new BadRequestException('Not all conditions are met');
    }

    try {
      const userAchievement = this.userAchievementRepository.create({
        achievement,
        user,
        wallet: user.wallets[0],
      });

      await this.userAchievementRepository.save(userAchievement);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    user?: User,
  ): Promise<void> {
    try {
      if (user && id !== user?.id?.toString()) {
        throw new BadRequestException();
      }

      const { role, ...otherData } = updateUserDto;

      if (otherData.walletAddress) {
        const anotherUser = await this.findByWalletAddress(
          otherData.walletAddress,
        ).catch(() => null);

        if (anotherUser && anotherUser.id !== user.id) {
          throw new BadRequestException(
            `${otherData.walletAddress} already used`,
          );
        }

        if (user.walletAddress !== null) {
          throw new BadRequestException(`You can't change your wallet address`);
        }

        await this.createWallet(
          otherData.walletAddress,
          true,
          BlockchainEnum.EVM,
          user,
        );
      }

      const updatedBody: QueryDeepPartialEntity<User> = {
        ...otherData,
        updatedAt: new Date(),
      };

      if (role) {
        updatedBody.roles = [role];
      }

      await this.usersRepository.update(id, updatedBody);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string, user: User): Promise<void> {
    try {
      if (id !== user.id.toString()) {
        throw new BadRequestException();
      }

      await this.usersRepository.delete(id);
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async deleteWallet(walletAddress: string, user: User): Promise<void> {
    const wallet = await this.findWallet(walletAddress.toLowerCase());

    if (wallet.user.id !== user.id) {
      throw new BadRequestException("You can't delete someone else's wallet");
    }

    await this.userWalletRepository.delete(wallet.id);
  }

  getUserAvatar(user: User): string | null {
    if (user.discord && user.discord.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}`;
    }

    if (user.steam && user.steam.avatar) {
      return user.steam.avatar;
    }

    return null;
  }

  async getUsersBalance(userIds: string[]): Promise<UserBalanceDto[]> {
    const balances = await this.userBalanceRepository
      .createQueryBuilder('record')
      .leftJoin('record.user', 'user')
      .where({ user: { id: In(userIds) } })
      .groupBy('user.id')
      .select('SUM(record.amount)::int as amount, user.id as "userId"')
      .getRawMany();

    return balances.map((balance) => plainToInstance(UserBalanceDto, balance));
  }

  async getBalance(userId: User['id']): Promise<UserBalanceDto> {
    const balance = await this.userBalanceRepository
      .createQueryBuilder('record')
      .leftJoin('record.user', 'user')
      .where('user.id = :userId', { userId })
      .groupBy('user.id')
      .select('SUM(record.amount)::int as amount')
      .getRawOne();

    return plainToInstance(UserBalanceDto, balance);
  }

  async addBalanceRecord(
    userId: User['id'],
    addUserBalanceDto: UserBalanceDto,
  ): Promise<UserBalanceDto> {
    const user = await this.findById(userId.toString());

    try {
      const { amount } = addUserBalanceDto;
      const record = this.userBalanceRepository.create({ user, amount });

      await this.userBalanceRepository.save(record);

      return this.getBalance(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async removeDiscordRole(discordId: string) {
    return firstValueFrom(
      this.httpService.post(
        `${DISCORD_BOT_URL}/del-role`,
        {
          userId: discordId,
          roleId: DISCORD_ROLE_ID,
        },
        { headers: { 'access-token': DISCORD_BOT_TOKEN } },
      ),
    ).catch((e) => {
      this.logger.error(e.message);
      return null;
    });
  }

  private async grantDiscordRole(discordId: string) {
    return firstValueFrom(
      this.httpService.post(
        `${DISCORD_BOT_URL}/add-role`,
        {
          userId: discordId,
          roleId: DISCORD_ROLE_ID,
        },
        { headers: { 'access-token': DISCORD_BOT_TOKEN } },
      ),
    ).catch((e) => {
      this.logger.error(e.message);
      return null;
    });
  }

  public static getMessageForSign(nonce: string) {
    return `I am signing my one-time nonce: ${nonce}`;
  }
}
