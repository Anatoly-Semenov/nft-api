import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetItemsListDto } from 'src/common/dto/get-items-list.dto';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { RegularManagerOptions } from 'src/types';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/CreateFeedback.dto';
import { FeedbackDto } from './dto/Feedback.dto';
import { UpdateFeedbackDto } from './dto/UpdateFeedback.dto';
import { Feedback } from './entities/Feedback.entity';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(
    userId: User['id'] | undefined,
    payload: CreateFeedbackDto,
  ): Promise<FeedbackDto> {
    const feedback = new Feedback({
      ...payload,
      ...(userId && { creator: { id: userId } }),
    });

    await this.feedbackRepository.save(feedback).catch((err) => {
      this.logger.error(new Error(err));

      throw new BadRequestException('Feedback creation has failed.');
    });

    return new FeedbackDto(feedback);
  }

  async getList(
    options?: GetItemsListDto,
  ): Promise<ItemsListResponseDto<FeedbackDto>> {
    const { limit = 10, offset = 0 } = options || {};

    const [items, count] = await this.feedbackRepository
      .findAndCount({
        take: limit,
        skip: offset,
      })
      .catch((err) => {
        this.logger.error(new Error(err));

        throw new BadRequestException('Get feedback list has failed.');
      });

    return new ItemsListResponseDto({
      items: items.map((i) => new FeedbackDto(i)),
      count,
    });
  }

  async getOne(id: Feedback['id']): Promise<FeedbackDto> {
    const feedback = await this.findOneById(id, { relations: ['creator'] });

    return new FeedbackDto(feedback);
  }

  async findOneById(
    id: Feedback['id'],
    options?: RegularManagerOptions,
  ): Promise<FeedbackDto> {
    const { relations } = options || {};

    const feedback = await this.feedbackRepository
      .findOne({
        ...(relations && { relations }),
        where: { id },
      })
      .catch((err) => {
        this.logger.error(new Error(err));

        throw new BadRequestException('Feedback finding has failed.');
      });

    if (!feedback) {
      throw new NotFoundException(`Can not find feedback by id: ${id}`);
    }

    return new FeedbackDto(feedback);
  }

  async findManyByIds(ids: Feedback['id'][]): Promise<FeedbackDto[]> {
    const feedbackList = await this.feedbackRepository
      .find({
        id: In(ids),
      })
      .catch((err) => {
        this.logger.error(new Error(err));

        throw new BadRequestException('Feedback list finding has failed.');
      });

    return feedbackList.map((i) => new FeedbackDto(i));
  }

  async deleteOneById(id: Feedback['id']): Promise<void> {
    const feedback = await this.findOneById(id);

    await this.feedbackRepository.remove(feedback).catch((err) => {
      this.logger.error(new Error(err));

      throw new BadRequestException('Feedback removing has failed.');
    });
  }

  async deleteManyByIds(ids: Feedback['id'][]): Promise<void> {
    await this.feedbackRepository
      .delete({
        id: In(ids),
      })
      .catch((err) => {
        this.logger.error(new Error(err));

        throw new BadRequestException('Feedback list removing has failed.');
      });
  }

  async updateOne(
    id: Feedback['id'],
    payload: UpdateFeedbackDto,
    options?: RegularManagerOptions,
  ): Promise<void> {
    const feedback = await this.findOneById(id, options);

    await this.feedbackRepository
      .save({
        ...feedback,
        ...payload,
      })
      .catch((err) => {
        this.logger.error(new Error(err));

        throw new BadRequestException('Feedback updating has failed.');
      });
  }
}
