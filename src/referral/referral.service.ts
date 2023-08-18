import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// Services
import { UsersService } from 'src/users/users.service';

// Entity
import { Referral } from './entities/referral.entity';
import { UserMintedAchievement } from 'src/users/entities/user-minted-achievement.entity';
import { UserBalanceRecord } from 'src/users/entities/user-balance-record.entity';

// DTO
import { ListDto } from 'src/common/dto/list.dto';
import { MetaListDto } from 'src/common/dto/meta-list.dto';
import { QueryListDto } from '../common/dto/query-list.dto';
import { ReferralUserDto, TotalResponseDto } from './dto';

@Injectable()
export class ReferralService {
  constructor(
    private readonly usersService: UsersService,

    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,

    @InjectRepository(UserBalanceRecord)
    private userBalanceRepository: Repository<UserBalanceRecord>,

    @InjectRepository(UserBalanceRecord)
    private userMintedAchievementRepository: Repository<UserMintedAchievement>,
  ) {}

  async getUsersList(
    myUserId: number,
    query: QueryListDto,
  ): Promise<ListDto<ReferralUserDto>> {
    const { page = 1, limit = 25 } = query;

    const skip = +limit * page - +limit;

    try {
      // Get referral users from db
      const [response, count] = await this.referralRepository.findAndCount({
        where: {
          sender: { id: myUserId },
        },
        skip,
        take: +limit,
        relations: [
          'newUser',
          'newUser.records',
          'newUser.mintedAchievements',
          'newUser.mintedAchievements.achievement',
          'newUser.mintedAchievements.achievement.game',
        ],
      });

      // Prepare data
      const data = this.prepareUsersListData(response);

      // Set meta
      const meta = new MetaListDto({
        total_items: count,
        total_pages: Math.round(count / limit) || 1,
        current_page: +page,
      });

      return new ListDto<ReferralUserDto>({ data, meta });
    } catch (error: any) {
      throw new BadRequestException('Failed to get referral users', error);
    }
  }

  async getTotal(myUserId: number): Promise<TotalResponseDto> {
    const [response, users] = await this.referralRepository.findAndCount({
      where: {
        sender: { id: myUserId },
      },
      relations: ['newUser'],
    });

    const referralsIds: number[] = response.map(({ newUser }) => newUser.id);

    const balance = await this.getBalanceByUsersIds(referralsIds);
    const achievements = await this.getNumberOfAchievementsByUsersIds(
      referralsIds,
    );

    return {
      users,
      balance,
      achievements,
    };
  }

  async createReferral(senderId: number, newUserId: number): Promise<Referral> {
    try {
      const referral = await this.referralRepository.create({
        sender: { id: senderId },
        newUser: { id: newUserId },
      });

      return await this.referralRepository.save(referral);
    } catch (error: any) {
      throw new BadRequestException('Failed to create referral', error);
    }
  }

  private prepareUsersListData(response): ReferralUserDto[] {
    return response.map(({ newUser }) => {
      const balance: number = newUser?.records?.length
        ? newUser.records
            .map(({ amount }) => amount)
            .reduce((sum, elem) => sum + elem, 0)
        : 0;

      const achievements: number = newUser?.mintedAchievements?.length
        ? newUser.mintedAchievements.length
        : 0;

      const points: number = this.getPointsByAchievements(
        newUser?.mintedAchievements || [],
      );

      const games: number = newUser.mintedAchievements
        .map((achievement) => achievement?.achievement?.game?.id)
        .filter((id, index, self) => self.indexOf(id) === index).length;

      return new ReferralUserDto({
        user: {
          id: newUser.id,
          displayedName: newUser.displayedName,
          walletAddress: newUser.walletAddress,
          avatar: this.usersService.getUserAvatar(newUser),
        },
        achievements,
        games,
        balance,
        points,
      });
    });
  }

  private getPointsByAchievements(
    achievements: UserMintedAchievement[],
  ): number {
    if (achievements.length) {
      return achievements.reduce((acc, curr) => {
        return acc + curr.achievement?.scores || 0;
      }, 0);
    }

    return 0;
  }

  private async getBalanceByUsersIds(usersIds: number[]): Promise<number> {
    const balanceResponse = await this.userBalanceRepository.find({
      where: {
        user: {
          id: In(usersIds),
        },
      },
    });

    let balance = 0;

    balanceResponse.forEach(({ amount }) => {
      balance += amount;
    });

    return balance;
  }

  private async getNumberOfAchievementsByUsersIds(
    usersIds: number[],
  ): Promise<number> {
    return await this.userMintedAchievementRepository.count({
      where: {
        user: { id: In(usersIds) },
      },
    });
  }
}
