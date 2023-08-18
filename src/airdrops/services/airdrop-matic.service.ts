import { Inject, Injectable, Logger } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../../profile/profile.service';
import { UsersService } from '../../users/users.service';
import {
  AIRDROP_MATIC_REPOSITORY_SERVICE_NAME,
  AirdropMaticRepository,
} from '../repositories/airdrop-matic.repository';
import { AirdropMaticStatus } from '../enums/airdrop-matic-status.enum';
import { AirdropMatic } from '../entities/airdrop-matic.entity';

const TRANSACTION_STATUS_SUCCESSFUL = 1;
const REQUEST_TIME_DELAYED = 1000 * 60 * 60 * 4;
const MIN_USD_SPENDING_IN_GAME = 10;
const MIN_MATIC_AIRDROP = 1;
const AIRDROP_ADDRESS_PRIVATE_KEY =
  '0x74d5b8ecb3ad033319a0f0de0c9c5f5b90d4dfa4858ba53c7705f0419ca19e70';

@Injectable()
export class AirdropMaticService {
  private readonly logger = new Logger(AirdropMaticService.name);

  private provider: ethers.providers.InfuraProvider;
  private wallet: ethers.Wallet;

  constructor(
    private configService: ConfigService,
    private profileService: ProfileService,
    private usersService: UsersService,
    @Inject(AIRDROP_MATIC_REPOSITORY_SERVICE_NAME)
    private readonly airdropMaticRepository: AirdropMaticRepository,
  ) {
    this.provider = new ethers.providers.InfuraProvider(
      configService.get<string>('airdropMaticNetwork'),
      configService.get<string>('infuraApiKey'),
    );

    this.wallet = new ethers.Wallet(AIRDROP_ADDRESS_PRIVATE_KEY, this.provider);
  }

  async send(userId: number): Promise<string> {
    const isAllowedGetMatic = await this.isAllowedGetMatic(userId);

    if (!isAllowedGetMatic) {
      return '';
    }

    const walletAddress = await this.getWalletAddress(userId);

    try {
      const entity = new AirdropMatic();
      entity.user_id = userId;

      await this.airdropMaticRepository.save(entity);

      const transactionHash = await this.sendMatic(walletAddress);

      entity.transaction_hash = transactionHash;

      await this.airdropMaticRepository.save(entity);

      return transactionHash;
    } catch (e) {
      return '';
    }
  }

  async isAllowedGetMatic(userId: number): Promise<boolean> {
    const isAlreadyAirdropped = await this.isAlreadyAirdropped(userId);
    if (isAlreadyAirdropped) {
      return false;
    }

    const walletAddress = await this.getWalletAddress(userId);
    if (!walletAddress) {
      return false;
    }

    return await this.hasSpendingInSomeGame(userId);
  }

  private async sendMatic(receiverAddress: string): Promise<string> {
    const isEnoughMatic = await this.isEnoughMatic();
    if (!isEnoughMatic) {
      return '';
    }

    const gasPrice = await this.getGasPrice();

    const transaction = {
      to: receiverAddress,
      value: ethers.utils.parseEther(MIN_MATIC_AIRDROP.toString()),
      gasPrice,
    };

    try {
      const tx = await this.wallet.sendTransaction(transaction);
      return tx.hash;
    } catch (e) {
      this.logger.error(`Method "sendTransaction". Reason: ${e.message}`);
      return '';
    }
  }

  private async isEnoughMatic(): Promise<boolean> {
    const balance = await this.getBalance();
    const gasPrice = await this.getGasPrice();
    const minMaticAirdropIntoWei = this.maticIntoWei(MIN_MATIC_AIRDROP);

    const minRequiredBalance = gasPrice.add(minMaticAirdropIntoWei);

    return balance.gt(minRequiredBalance);
  }

  private async getBalance(): Promise<BigNumber> {
    try {
      return await this.wallet.getBalance();
    } catch (e) {
      this.logger.error(`Method "getBalance". Reason: ${e.message}`);
      return BigNumber.from(0);
    }
  }

  private async getGasPrice(): Promise<BigNumber> {
    try {
      return await this.provider.getGasPrice();
    } catch (e) {
      this.logger.error(`Method "getGasPrice". Reason: ${e.message}`);
      return this.maticIntoWei(1);
    }
  }

  private maticIntoWei(amount: number): BigNumber {
    return ethers.utils.parseEther(amount.toString());
  }

  private async isAlreadyAirdropped(userId: number): Promise<boolean> {
    const entity = await this.airdropMaticRepository.findByUserId(userId);

    if (!entity) {
      return false;
    }

    if (
      this.checkAirdropStatus(entity.status) ||
      this.checkAirdropRequestTime(entity.request_time)
    ) {
      return true;
    }

    return await this.checkAirdropTransaction(entity);
  }

  private async getWalletAddress(userId: number): Promise<string | null> {
    const user = await this.usersService.findById(userId.toString());
    if (!user) {
      return null;
    }

    return user.walletAddress;
  }

  private async hasSpendingInSomeGame(userId: number): Promise<boolean> {
    try {
      const gameList = await this.profileService.getGameList(userId);
      const spending = gameList.total.spending;

      return spending > MIN_USD_SPENDING_IN_GAME;
    } catch (e) {
      return false;
    }
  }

  private async isTransactionConfirmed(
    transactionHash: string,
  ): Promise<boolean> {
    try {
      const txReceipt = await this.provider.getTransactionReceipt(
        transactionHash,
      );

      return !!(
        txReceipt &&
        txReceipt.blockNumber &&
        txReceipt.status === TRANSACTION_STATUS_SUCCESSFUL
      );
    } catch (e) {
      this.logger.error(`Method "getTransactionReceipt". Reason: ${e.message}`);
      return true;
    }
  }

  private checkAirdropStatus(status: AirdropMaticStatus): boolean {
    return status === AirdropMaticStatus.VERIFIED_SEND;
  }

  private checkAirdropRequestTime(previousRequestTime: Date): boolean {
    const now = new Date();
    const nextRequestTime = new Date();
    nextRequestTime.setTime(
      previousRequestTime.getTime() + REQUEST_TIME_DELAYED,
    );

    return nextRequestTime > now;
  }

  private async checkAirdropTransaction(
    entity: AirdropMatic,
  ): Promise<boolean> {
    if (!entity.transaction_hash) {
      await this.airdropMaticRepository.remove(entity);
      return false;
    }

    const isTransactionConfirmed = await this.isTransactionConfirmed(
      entity.transaction_hash,
    );

    if (isTransactionConfirmed) {
      entity.status = AirdropMaticStatus.VERIFIED_SEND;
      await this.airdropMaticRepository.save(entity);

      return true;
    }

    await this.airdropMaticRepository.remove(entity);
    return false;
  }
}
