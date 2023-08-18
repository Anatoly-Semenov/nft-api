import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolanaAssociatedTokenAccount } from '../entities/solana-associated-token-account.entity';
import { getConnection, In, Repository } from 'typeorm';
import { SolanaAssociatedTokenAccountType } from '../enums/solana-associated-token-account-type.enum';
import { TokenAccountInfo } from '../types/TokenAccountInfo';

export const SOLANA_ASSOCIATED_TOKEN_ACCOUNT_REPOSITORY_SERVICE_NAME =
  'SOLANA_ASSOCIATED_TOKEN_ACCOUNT_REPOSITORY';

@Injectable()
export class SolanaAssociatedTokenAccountRepository {
  constructor(
    @InjectRepository(SolanaAssociatedTokenAccount)
    private readonly associatedTokenAccountRepository: Repository<SolanaAssociatedTokenAccount>,
  ) {}

  multipleInsert(values: SolanaAssociatedTokenAccount[]) {
    return getConnection()
      .createQueryBuilder()
      .insert()
      .into(SolanaAssociatedTokenAccount)
      .values(values)
      .execute();
  }

  save(
    account: SolanaAssociatedTokenAccount,
  ): Promise<SolanaAssociatedTokenAccount> {
    return this.associatedTokenAccountRepository.save(account);
  }

  findByTypeAndAccountId(
    type: SolanaAssociatedTokenAccountType,
    accountId: number,
    take: number,
  ): Promise<SolanaAssociatedTokenAccount[]> {
    return this.associatedTokenAccountRepository.find({
      where: {
        type,
        account_id: accountId,
      },
      take,
    });
  }

  findUnique(mint: string, associatedTokenAccount: string, accountId: number) {
    return this.associatedTokenAccountRepository.findOne({
      mint,
      associated_token_account: associatedTokenAccount,
      account_id: accountId,
    });
  }

  findByAssociatedTokenAccountPublicKey(
    associatedTokenAccount: string,
  ): Promise<SolanaAssociatedTokenAccount[]> {
    return this.associatedTokenAccountRepository.find({
      where: {
        associated_token_account: associatedTokenAccount,
      },
    });
  }

  async findByTokenAccountsInfo(
    tokenAccountsInfo: TokenAccountInfo[],
  ): Promise<SolanaAssociatedTokenAccount[]> {
    if (!tokenAccountsInfo.length) {
      return [];
    }

    return await this.associatedTokenAccountRepository.find({
      where: tokenAccountsInfo,
    });
  }

  findByAssociatedTokenAccountList(
    associatedTokenAccountList: string[],
  ): Promise<SolanaAssociatedTokenAccount[]> {
    return this.associatedTokenAccountRepository.find({
      where: {
        associated_token_account: In(associatedTokenAccountList),
      },
    });
  }

  bath250Nft(
    accountId: number,
    iteration: number,
  ): Promise<SolanaAssociatedTokenAccount[]> {
    const range = 250;

    return this.associatedTokenAccountRepository.find({
      where: {
        type: SolanaAssociatedTokenAccountType.NFT,
        account_id: accountId,
      },
      take: range,
      skip: iteration * range,
      order: { id: 'ASC' },
    });
  }
}
