import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolanaAccount } from '../entities/solana-account.entity';
import { In, Repository } from 'typeorm';

export const SOLANA_ACCOUNT_REPOSITORY_SERVICE_NAME =
  'SOLANA_ACCOUNT_REPOSITORY';

@Injectable()
export class SolanaAccountRepository {
  constructor(
    @InjectRepository(SolanaAccount)
    private readonly repository: Repository<SolanaAccount>,
  ) {}

  findByAddress(address: string): Promise<SolanaAccount | undefined> {
    return this.repository.findOne({
      address,
    });
  }

  save(entity: SolanaAccount): Promise<SolanaAccount> {
    return this.repository.save(entity);
  }

  findUnique(
    address: string,
    gameId: number,
  ): Promise<SolanaAccount | undefined> {
    return this.repository.findOne({
      address,
      game_id: gameId,
    });
  }

  findById(id: number): Promise<SolanaAccount | undefined> {
    return this.repository.findOne({ id });
  }

  async updateFirstTime(
    id: number,
    firstTimeMilliseconds: number,
  ): Promise<boolean> {
    const seconds = Math.round(firstTimeMilliseconds / 1000);
    let result = false;

    if (Number.isInteger(seconds) && Number.isInteger(id)) {
      await this.repository.query(
        `update solana_account set first_time = to_timestamp(${seconds}) where id = ${id} and first_time > to_timestamp(${seconds});`,
      );

      result = true;
    }

    return result;
  }

  findByAccountList(accountList: string[]): Promise<SolanaAccount[]> {
    return this.repository.find({
      where: {
        address: In(accountList),
      },
    });
  }
}
