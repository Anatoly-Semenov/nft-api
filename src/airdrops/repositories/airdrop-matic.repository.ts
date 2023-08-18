import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirdropMatic } from '../entities/airdrop-matic.entity';

export const AIRDROP_MATIC_REPOSITORY_SERVICE_NAME = 'AIRDROP_MATIC_REPOSITORY';

@Injectable()
export class AirdropMaticRepository {
  constructor(
    @InjectRepository(AirdropMatic)
    private readonly airdropMaticRepository: Repository<AirdropMatic>,
  ) {}

  findByUserId(userId: number): Promise<AirdropMatic | undefined> {
    return this.airdropMaticRepository.findOne({
      user_id: userId,
    });
  }

  save(entity: AirdropMatic): Promise<AirdropMatic> {
    return this.airdropMaticRepository.save(entity);
  }

  remove(entity: AirdropMatic): Promise<AirdropMatic> {
    return this.airdropMaticRepository.remove(entity);
  }
}
