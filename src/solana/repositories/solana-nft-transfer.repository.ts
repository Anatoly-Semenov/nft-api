import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolanaNftTransfer } from '../entities/solana-nft-transfer.entity';
import { getConnection, Repository } from 'typeorm';

export const SOLANA_NFT_TRANSFER_REPOSITORY_SERVICE_NAME =
  'SOLANA_NFT_TRANSFER_REPOSITORY';

@Injectable()
export class SolanaNftTransferRepository {
  constructor(
    @InjectRepository(SolanaNftTransfer)
    private readonly nftTransferRepository: Repository<SolanaNftTransfer>,
  ) {}

  findLastTransferByMint(mint: string) {
    return this.nftTransferRepository.findOne({
      where: {
        token_id: mint,
      },
      order: { created_at: 'DESC' },
    });
  }

  multipleInsert(values: SolanaNftTransfer[]) {
    return getConnection()
      .createQueryBuilder()
      .insert()
      .into(SolanaNftTransfer)
      .values(values)
      .execute();
  }
}
