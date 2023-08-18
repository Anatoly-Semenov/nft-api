import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Game } from 'src/games/entities/game.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { AchievementProcessingDto } from './dto/achievement-processing.dto';
import { CreateAchievementRuleDto } from './dto/create-achievement-rule.dto';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { GetAchievementsDto } from './dto/get-achievements.dto';
import { NftMetadataDto } from './dto/nft-metadata.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from './entities/achievement.entity';
import { AchievementRuleHandler } from './enums/achievement-rule-handler';
import { AchievementsOnChainService } from './services/achievements-onchain.service';
import { NFTStorage, File } from 'nft.storage';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { VerifyClaimDto } from './dto/verify-claim.dto';
import { User } from 'src/users/entities/user.entity';
import { VerifyClaimResponseDto } from './dto/verify-claim-response.dto';
import { GameProvider } from 'src/games/enums/game-provider.enum';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,
    @Inject(AchievementsOnChainService.name)
    private readonly achievementsOnChainService: AchievementsOnChainService,
    private readonly httpService: HttpService,
  ) {}

  async statusProcessing(payload: AchievementProcessingDto): Promise<boolean> {
    return this.achievementsOnChainService.statusProcessing(payload);
  }

  async startProcessing({ userId }: AchievementProcessingDto): Promise<void> {
    return this.achievementsOnChainService.startProcessing(userId);
  }

  async stopProcessing(): Promise<void> {
    return this.achievementsOnChainService.stopProcessing();
  }

  async getListByGameIds(
    gameIds: Game['id'][],
    relations?: Array<keyof Achievement>,
  ): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      where: { game: { id: In(gameIds) } },
      ...(relations && { relations }),
    });
  }

  getAchievementRuleHandlers(): string[] {
    return Object.keys(AchievementRuleHandler).map((k) => k);
  }

  async getList(getAchievementDto: GetAchievementsDto): Promise<Achievement[]> {
    const { gameId, ...rest } = getAchievementDto;

    const achievements = await this.achievementsRepository
      .find({
        where: { ...rest, game: { id: gameId } },
      })
      .catch((err) => {
        this.logger.error(new Error(err));

        throw err;
      });

    if (!achievements.length) {
      return [];
    }

    return achievements;
  }

  getByIds(
    ids: Achievement['id'][],
    relations?: string[],
  ): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      ...(relations && { relations }),
      where: { id: In(ids) },
    });
  }

  getAchievementsLength() {
    return this.achievementsRepository.count();
  }

  async getById(id: string, relations?: string[]): Promise<Achievement> {
    const achievement = await this.achievementsRepository.findOne(id, {
      relations,
    });

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    return achievement;
  }

  async create({
    gameId,
    ...createAchievementDto
  }: CreateAchievementDto): Promise<Achievement> {
    try {
      const achievement = await this.achievementsRepository.create({
        ...createAchievementDto,
        game: { id: gameId },
      });

      return this.achievementsRepository.save(achievement);
    } catch (error) {
      this.logger.error({ error });

      throw new BadRequestException(error);
    }
  }

  async addRule(
    id: string,
    createAchievementRuleDto: CreateAchievementRuleDto,
  ): Promise<void> {
    try {
      const achievement = await this.achievementsRepository.findOne(id);

      if (!achievement) {
        throw new NotFoundException('Achievement not found');
      }

      achievement.rules = [...achievement.rules, createAchievementRuleDto];
      this.achievementsRepository.save(achievement);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(
    id: string,
    updateAchievementDto: UpdateAchievementDto,
  ): Promise<void> {
    try {
      await this.achievementsRepository.update(id, updateAchievementDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.achievementsRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getMetadataList(): Promise<NftMetadataDto[]> {
    const achievements = await this.achievementsRepository.find({
      relations: ['game'],
      where: { image: Not(IsNull()) },
      order: { id: 'ASC' },
    });

    if (!achievements.length) {
      return [];
    }

    return achievements.map(
      ({ id, name, description, createdAt, image, game }) =>
        plainToInstance(
          NftMetadataDto,
          {
            id,
            name,
            description,
            createdAt,
            image,
            game: game?.title || null,
          },
          {
            excludeExtraneousValues: true,
          },
        ),
    );
  }

  async getDetailMetadata(id: number): Promise<NftMetadataDto> {
    const achievement = await this.achievementsRepository.findOne({
      relations: ['game'],
      where: { id },
    });

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    const data = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      createdAt: achievement.createdAt,
      image: achievement.image,
      game: achievement?.game?.title || null,
    };

    return plainToInstance(NftMetadataDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async pushMetadata(): Promise<{ folderURI: string }> {
    if (!process.env.NFT_STORE_API_KEY) {
      throw new BadRequestException('Storage key was not found');
    }

    const client = new NFTStorage({ token: process.env.NFT_STORE_API_KEY });
    const nfts = await this.achievementsRepository.find({
      relations: ['game'],
      where: { image: Not(IsNull()) },
    });

    if (!nfts.length) {
      throw new NotFoundException('Nfts not found');
    }

    try {
      const imageQueries = nfts.map(async ({ image, id }) => {
        const res = await firstValueFrom(
          this.httpService.get(image, { responseType: 'arraybuffer' }),
        );

        return new File([res.data], `${id}.png`, { type: 'image/png' });
      });

      const images = await Promise.all(imageQueries);
      const imagesDirectory = await NFTStorage.encodeDirectory(images);

      const files = nfts.map(({ id, name, description, createdAt, game }) => {
        const data = {
          id,
          name,
          description,
          createdAt,
          image: `https://ipfs.io/ipfs/${imagesDirectory.cid}/${id}.png`,
          game: game?.title || null,
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
      throw new BadRequestException('Error pushing nfts metadata');
    }
  }

  async verifyClaim(
    id: string,
    verifyClaimDto: VerifyClaimDto,
    user: User,
  ): Promise<VerifyClaimResponseDto> {
    const { walletAddress } = verifyClaimDto;

    // if (
    //   walletAddress &&
    //   !user.wallets.some(
    //     (el) => el.wallet === walletAddress.toLowerCase() && el.is_verified,
    //   )
    // ) {
    //   throw new ForbiddenException(
    //     "You don't have permissions to claim from this wallet",
    //   );
    // }

    const achievement = await this.achievementsRepository.findOne({
      relations: ['user', 'game'],
      where: { id },
    });

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    const userAchievement = user.achievements.find(
      (el) => achievement.id === el.achievement.id,
    );

    if (!userAchievement) {
      throw new BadRequestException("You didn't get the required achievements");
    }

    if (!process.env.NFT_PRIVATE_KEY) {
      throw new BadRequestException('Private key was not found');
    }

    const web3 = new Web3();

    const server = web3.eth.accounts.privateKeyToAccount(
      process.env.NFT_PRIVATE_KEY,
    );

    const game = achievement.game;
    const userProvider = this.getUserProviderId(game.provider, user);

    if (!userProvider) {
      throw new BadRequestException(
        `User doesn't have the correct provider ID`,
      );
    }

    const provider = web3.utils.sha3(game.provider);
    const userProviderId = web3.utils.sha3(userProvider);
    const achievementTypeId = achievement.id;
    const collectionId = game.id;
    const mintAccount = (walletAddress || user.walletAddress).toLowerCase();
    const msgSender = user.walletAddress.toLowerCase();

    const message = web3.utils.soliditySha3(
      msgSender,
      provider,
      userProviderId,
      mintAccount,
      achievementTypeId,
      collectionId,
    );

    return {
      signature: server.sign(message).signature,
      provider,
      userProviderId,
      mintAccount,
      achievementTypeId,
      collectionId,
    };
  }

  getUserProviderId = (provider: GameProvider, user: User): string => {
    switch (provider) {
      case GameProvider.SOLANA:
        return user.solanaAccount;

      case GameProvider.STEAM:
        return user.steam?.id;

      case GameProvider.EPIC_GAMES:
        return user.epicGames?.id;

      default:
        return user.walletAddress.toLowerCase();
    }
  };
}
