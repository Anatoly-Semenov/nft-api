import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolanaAccountTransaction } from '../entities/solana-account-transaction.entity';
import { getConnection, In, Repository } from 'typeorm';
import { SolanaSignature } from '../entities/solana-signature.entity';

export const SOLANA_ACCOUNT_TRANSACTION_REPOSITORY_SERVICE_NAME =
  'SOLANA_ACCOUNT_TRANSACTION_REPOSITORY';

@Injectable()
export class SolanaAccountTransactionRepository {
  constructor(
    @InjectRepository(SolanaAccountTransaction)
    private readonly accountTransactionRepository: Repository<SolanaAccountTransaction>,
  ) {}

  multipleInsert(values: SolanaAccountTransaction[]) {
    return getConnection()
      .createQueryBuilder()
      .insert()
      .into(SolanaAccountTransaction)
      .values(values)
      .execute();
  }

  deleteTransferList(gameId: number, signatureList: SolanaSignature[]) {
    return this.accountTransactionRepository.delete({
      game_id: gameId,
      transaction_hash: In(signatureList.map((i) => i.signature)),
    });
  }
}
