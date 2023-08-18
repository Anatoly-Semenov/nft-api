import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAirdropDto } from './dto/create-airdrop.dto';
import { GetAirdropListDto } from './dto/get-airdrop-list.dto';
import { UpdateAirdropDto } from './dto/update-airdrop.dto';
import { Airdrop } from './entities/airdrop.entity';

@Injectable()
export class AirdropsService {
  constructor(
    @InjectRepository(Airdrop) private airdropRepository: Repository<Airdrop>,
  ) {}

  async getList(getAirdropListDto: GetAirdropListDto): Promise<Airdrop[]> {
    const airdrops = await this.airdropRepository.find({
      where: getAirdropListDto,
    });

    if (!airdrops.length) {
      return [];
    }

    return airdrops;
  }

  async getById(id: string): Promise<Airdrop> {
    const airdrop = await this.airdropRepository.findOne({ where: { id } });

    if (!airdrop) {
      throw new NotFoundException('Airdrop not found');
    }

    return airdrop;
  }

  async create(createAirdropDto: CreateAirdropDto): Promise<Airdrop> {
    try {
      const airdrop = this.airdropRepository.create(createAirdropDto);
      return this.airdropRepository.save(airdrop);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateAirdropDto: UpdateAirdropDto): Promise<void> {
    const airdrop = await this.getById(id);

    try {
      const updated = { ...airdrop, ...updateAirdropDto };
      await this.airdropRepository.save(updated);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.airdropRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
