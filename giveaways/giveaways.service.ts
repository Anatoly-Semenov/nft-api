import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { RegularManagerOptions } from 'src/types';
import { LessThan, Repository } from 'typeorm';
import { GiveawayDto } from './dto/giveaway.dto';
import { Giveaway } from './entities/giveaway.entity';

export const SERVICE_GIVEAWAY = 'SERVICE_GIVEAWAY';

@Injectable()
export class GiveawayService {
  private readonly logger = new Logger(GiveawayService.name);

  constructor(
    @InjectRepository(Giveaway)
    private readonly giveawayRepository: Repository<Giveaway>,
  ) {}

  async getGiveawayById(giveawayId: GiveawayDto['id']): Promise<GiveawayDto> {
    const [record] = await this.giveawayRepository.findByIds([giveawayId]);

    if (!record) {
      throw new NotFoundException(`Can not find giveaway by id ${giveawayId}`);
    }

    const giveaway = plainToInstance(GiveawayDto, record, {
      excludeExtraneousValues: true,
    });

    return giveaway;
  }

  async getGiveawayListAll(
    options?: RegularManagerOptions,
  ): Promise<ItemsListResponseDto<GiveawayDto>> {
    const [giveawayList, count] = await this.giveawayRepository.findAndCount({
      ...options,
      order: { created_at: 'ASC' },
    });

    const items = giveawayList.map((i) =>
      plainToInstance(GiveawayDto, i, { excludeExtraneousValues: true }),
    );

    return {
      items,
      count,
    };
  }

  async getGiveawayList(): Promise<GiveawayDto[]> {
    const nowDate = new Date().toISOString();

    const recordList = await this.giveawayRepository.find({
      where: { end_date: LessThan(nowDate) },
    });

    const giveawayList = recordList.map((i) =>
      plainToInstance(GiveawayDto, i, { excludeExtraneousValues: true }),
    );

    return giveawayList;
  }

  async updateGiveawayById(
    giveawayId: GiveawayDto['id'],
    payload: Omit<GiveawayDto, 'id'>,
  ): Promise<GiveawayDto> {
    const record = await this.getGiveawayById(giveawayId);

    const updated = await this.giveawayRepository.save({
      ...record,
      ...payload,
    });

    const giveaway = plainToInstance(GiveawayDto, updated, {
      excludeExtraneousValues: true,
    });

    return giveaway;
  }

  async removeGiveawayById(giveawayId: GiveawayDto['id']): Promise<boolean> {
    const record = await this.getGiveawayById(giveawayId);

    const result = await this.giveawayRepository.remove(record);

    return !!result;
  }

  async createGiveaway(payload: Omit<GiveawayDto, 'id'>): Promise<GiveawayDto> {
    const entity = new Giveaway();

    const record = await this.giveawayRepository.save({
      ...entity,
      ...payload,
    });

    const giveaway = plainToInstance(GiveawayDto, record, {
      excludeExtraneousValues: true,
    });

    return giveaway;
  }
}
