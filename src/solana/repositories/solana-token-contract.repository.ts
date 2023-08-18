import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolanaTokenContract } from '../entities/solana-token-contract.entity';
import { In, Repository } from 'typeorm';

export const SOLANA_TOKEN_CONTRACT_REPOSITORY_SERVICE_NAME =
  'SOLANA_TOKEN_CONTRACT_REPOSITORY';

@Injectable()
export class SolanaTokenContractRepository {
  constructor(
    @InjectRepository(SolanaTokenContract)
    private readonly tokenContractRepository: Repository<SolanaTokenContract>,
  ) {}

  findByAddress(
    tokenAddress: string,
  ): Promise<SolanaTokenContract | undefined> {
    return this.tokenContractRepository.findOne({
      address: tokenAddress,
    });
  }

  findByAddressList(addressList: string[]): Promise<SolanaTokenContract[]> {
    return this.tokenContractRepository.find({
      where: {
        address: In(addressList),
      },
    });
  }
}
