import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ParserProgress } from '../entities/parser-progress.entity';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ProgressStatus } from '../enums/progress-status.enum';
import { ParserLog } from '../entities/parser-log.entity';
import { ParserConfigDto } from '../dto/parser-config.dto';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    @InjectRepository(ParserProgress)
    private repository: Repository<ParserProgress>,
    @InjectRepository(ParserLog)
    private parserLogRepository: Repository<ParserLog>,
  ) {}

  async get(dto: CreateProgressDto): Promise<ParserProgress> {
    const { gameId: game_id, type } = dto;
    const progress = await this.repository.findOne({ game_id, type });

    if (progress) {
      return await this.renew(progress, dto);
    } else {
      return await this.create(dto);
    }
  }

  nextStep(
    progress: ParserProgress,
    config: ParserConfigDto,
    size: number = null,
  ) {
    if (size !== null) {
      progress.current_value += size;
    } else {
      progress.current_value += progress.step;
    }

    if (progress.current_value > progress.end_value) {
      progress.current_value = progress.end_value;
    }

    const startMs = config.stepStartDate.getTime();
    const currentMs = new Date().getTime();
    const step = Math.round(
      (progress.current_value - config.stepStartValue) / progress.step,
    );
    const stepsCount = Math.round(
      (progress.end_value - config.stepStartValue) / progress.step,
    );

    if (step > 0) {
      const timeLeftMs = Math.round(
        ((currentMs - startMs) / step) * stepsCount,
      );
      progress.time_left_ms = isNaN(timeLeftMs) ? '0' : timeLeftMs.toString();
    }

    return this.save(progress);
  }

  async failed(progress: ParserProgress, reason: string) {
    progress.status = ProgressStatus.FAILED;

    const log = new ParserLog();
    log.parser_progress_id = progress.id;
    log.created_at = new Date();
    log.comment = reason;
    log.current_value = progress.current_value;
    await this.parserLogRepository.save(log);

    return this.save(progress);
  }

  cliDisplay(progress: ParserProgress, config: ParserConfigDto) {
    const all = progress.end_value - config.stepStartValue;
    const current = progress.current_value - config.stepStartValue;
    const percent = Math.floor((current / all) * 1000) / 10;

    let msg = 'Progress: ' + percent + '%';

    const minLeft = Math.round(parseInt(progress.time_left_ms) / 1000 / 60);
    msg += ' (Left ' + minLeft + 'min)';

    this.logger.log(msg);
    console.log('');
  }

  getListByGame(gameId: number) {
    return this.repository.find({
      where: { game_id: gameId },
      order: { id: 'ASC' },
    });
  }

  getActiveListByGame(gameId: number) {
    return this.repository.find({
      where: {
        game_id: gameId,
        status: In([ProgressStatus.ACTIVE, ProgressStatus.WAIT]),
      },
      order: { id: 'ASC' },
    });
  }

  async hasActive() {
    return !!(await this.repository.findOne({
      status: In([ProgressStatus.ACTIVE, ProgressStatus.WAIT]),
    }));
  }

  getLastByGame(gameId?: number) {
    return this.repository.findOne({
      where: {
        game_id: gameId,
      },
      order: {
        updated_at: 'DESC',
      },
    });
  }

  async pause(gameId: number) {
    const progressList = await this.getActiveListByGame(gameId);

    progressList.map((item) => {
      item.status = ProgressStatus.PAUSED;
      this.save(item);
    });
  }

  async wait(gameId: number) {
    const progressList = await this.getListByGame(gameId);

    await Promise.all(
      progressList.map((item) => {
        item.status = ProgressStatus.WAIT;
        item.updated_at = new Date();
        return this.repository.save(item);
      }),
    );
  }

  finish(progress: ParserProgress, newEnd: number = null) {
    progress.status = ProgressStatus.COMPLETED;

    if (newEnd !== null) {
      progress.end_value = newEnd;
      if (progress.end_value < progress.current_value) {
        progress.current_value = progress.end_value;
      }
    }

    return this.save(progress);
  }

  async isPaused(gameId: number): Promise<boolean> {
    const progress = await this.repository.findOne({
      game_id: gameId,
      status: ProgressStatus.PAUSED,
    });

    return !!progress;
  }

  isActive(progress: ParserProgress) {
    return (
      progress.status === ProgressStatus.ACTIVE &&
      progress.current_value < progress.end_value
    );
  }

  private renew(progress: ParserProgress, dto: CreateProgressDto) {
    progress.started_at = new Date();
    progress.step = dto.step;
    progress.status = ProgressStatus.ACTIVE;

    if (dto.start !== null && dto.start !== progress.start_value) {
      progress.start_value = dto.start;
      progress.current_value = progress.start_value;
    }

    if (!dto.isIncremental) {
      progress.start_value = 0;
      progress.current_value = progress.start_value;
    }

    if (dto.end < progress.end_value) {
      progress.current_value = progress.start_value;
    }
    progress.end_value = dto.end;

    return this.save(progress);
  }

  private create(dto: CreateProgressDto) {
    const progress = new ParserProgress();
    progress.started_at = new Date();
    progress.step = dto.step;
    progress.status = ProgressStatus.ACTIVE;
    progress.type = dto.type;
    progress.game_id = dto.gameId;
    progress.time_left_ms = '-1';

    progress.start_value = dto.start || 0;
    progress.end_value = dto.end;
    progress.current_value = progress.start_value;

    return this.save(progress);
  }

  private async save(progress: ParserProgress) {
    const fromBD = await this.repository.findOne({
      id: progress.id,
    });

    if (ProgressStatus.PAUSED === fromBD?.status) {
      progress.status = fromBD.status;
    }

    progress.updated_at = new Date();

    try {
      return await this.repository.save(progress);
    } catch (e) {
      throw new Error(e.stack);
    }
  }

  public async pureSave(progress: ParserProgress) {
    return await this.repository.save(progress);
  }
}
