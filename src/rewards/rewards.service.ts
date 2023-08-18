import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { SettingsKey } from 'src/settings/enums/settings-key.enum';
import { SettingsService } from 'src/settings/settings.service';
import {
  FindConditions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { GetRewardsDto } from './dto/get-rewards.dto';
import { RewardsResponseDto } from './dto/rewards-response.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private readonly settingsService: SettingsService,
  ) {}

  async getList(getRewardsDto: GetRewardsDto): Promise<RewardsResponseDto> {
    const filter: FindConditions<Reward> = {};

    if (getRewardsDto.date) {
      const date = moment(getRewardsDto.date).format('YYYY-MM-DD hh:mm:ss');

      filter.startedAt = LessThanOrEqual(date);
      filter.endedAt = MoreThanOrEqual(date);
    }

    const [rewards, learnMoreSetting] = await Promise.all([
      this.rewardRepository.find({ where: filter }),
      this.settingsService.getByKey(SettingsKey.REWARDS_LEARN_MORE_LINK),
    ]);
    const link = learnMoreSetting?.value || null;

    if (!rewards.length) {
      return new RewardsResponseDto({
        list: [],
        date: null,
        link,
      });
    }

    const dates: moment.Moment[] = rewards
      .reduce((prev, curr) => [...prev, curr.startedAt, curr.endedAt], [])
      .sort((a, b) => a - b)
      .map((date) => moment(date));

    return new RewardsResponseDto({
      list: rewards,
      link,
      date: `${dates.shift().format('MMM DD, YYYY')} - ${dates
        .pop()
        .format('MMM DD, YYYY')}`,
    });
  }

  async getById(id: Reward['id']): Promise<Reward> {
    const reward = await this.rewardRepository.findOne(id);

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    return reward;
  }

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      const startedAt = moment(createRewardDto.startedAt).startOf('day');
      let endedAt: moment.Moment | Date = createRewardDto.endedAt;

      if (!endedAt) {
        endedAt = moment(createRewardDto.startedAt);
        endedAt.set('day', startedAt.get('day') + 7).endOf('day');
      } else {
        endedAt = moment(createRewardDto.endedAt).endOf('day');
      }

      const data = this.rewardRepository.create({
        ...createRewardDto,
        endedAt,
        startedAt,
      });
      const reward = await this.rewardRepository.save(data);

      return reward;
    } catch (error) {
      throw new BadRequestException(error.message, error.stack);
    }
  }

  async update(
    id: Reward['id'],
    updateRewardDto: UpdateRewardDto,
  ): Promise<void> {
    const reward = await this.getById(id);

    try {
      await this.rewardRepository.save({ ...reward, ...updateRewardDto });
    } catch (error) {
      throw new BadRequestException(error.message, error.stack);
    }
  }

  async delete(id: Reward['id']): Promise<void> {
    const reward = await this.getById(id);

    try {
      await this.rewardRepository.remove(reward);
    } catch (error) {
      throw new BadRequestException(error.message, error.stack);
    }
  }
}
