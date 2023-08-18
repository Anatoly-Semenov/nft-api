import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParserAutostart } from '../entities/parser-autostart.entity';
import { ParserAutostartStatus } from '../enums/parser-autostart-status.enum';
import { ProgressService } from './progress.service';

@Injectable()
export class AutostartService {
  private readonly logger = new Logger(AutostartService.name);

  constructor(
    @InjectRepository(ParserAutostart)
    private repository: Repository<ParserAutostart>,
    private progressService: ProgressService,
  ) {}

  public async addToRotation(gameId: number) {
    let entity = await this.repository.findOne({ gameId });

    if (entity) {
      entity.finishedAt = new Date();
    } else {
      entity = this.create(gameId);
    }

    return this.repository.save(entity);
  }

  async getGameForRun() {
    if (await this.progressService.hasActive()) {
      this.logger.warn('Some game have active parsing');
      return null;
    }

    return this.repository.findOne({
      order: {
        finishedAt: 'ASC',
      },
    });
  }

  private create(gameId) {
    const entity = new ParserAutostart();
    entity.gameId = gameId;
    entity.createdAt = new Date();
    entity.finishedAt = new Date();
    entity.status = ParserAutostartStatus.WAIT;

    return entity;
  }
}
