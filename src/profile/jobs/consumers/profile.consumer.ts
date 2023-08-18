import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { MoralisLogsItemDto } from 'src/profile/dto/moralis-logs-item.dto';
import { ProfileMoralisStatus } from 'src/profile/enums/profile-moralis-status.enum';
import { ProfileService } from 'src/profile/profile.service';
import { ProfileProcessorList, ProfileQueueList } from 'src/profile/types';
import { UsersService } from 'src/users/users.service';

@Processor(ProfileProcessorList.FetchMintedAchievements)
export class ProfileConsumer {
  private readonly logger = new Logger(ProfileConsumer.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  private fetchContractLogs = async (
    cursor?: string,
  ): Promise<MoralisLogsItemDto[]> => {
    const res = await this.profileService.getMoralisContractLogs({
      limit: 500,
      cursor,
    });

    const items: MoralisLogsItemDto[] = res.result;

    if (res.cursor) {
      items.push(...(await this.fetchContractLogs(res.cursor)));
    }

    return items;
  };

  @Process(ProfileQueueList.FetchMintedAchievements)
  async fetchMintedAchievements(): Promise<void> {
    const transactions = await this.fetchContractLogs();

    const mintedAchievements = transactions.map((transaction) => ({
      achievement: Number(transaction.data.achievementTypeId),
      wallet: transaction.topic1,
      createdAt: new Date(transaction.block_timestamp),
    }));

    await this.usersService.addMintedAchievements(mintedAchievements);
  }

  @OnQueueCompleted()
  async onJobCompleted() {
    await this.profileService.addMoralisLogs(
      ProfileMoralisStatus.SUCCESS,
      `Complete minted achievements fetching for all users`,
    );

    this.logger.log(`Complete minted achievements fetching`);
  }

  @OnQueueFailed()
  async onJobFailed() {
    await this.profileService.addMoralisLogs(
      ProfileMoralisStatus.FAIL,
      `Fail minted achievements fetching for all users`,
    );

    this.logger.error(`Fail minted achievements fetching`);
  }
}
