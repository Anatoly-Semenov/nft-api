import { IParsingStage } from './parsing-stage.interface';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { ProgressService } from '../services/progress.service';
import { Logger } from '@nestjs/common';

export abstract class ParsingStageAbstract implements IParsingStage {
  protected progressSrv: ProgressService;
  protected logger: Logger;

  async run(config: ParserConfigDto) {
    const { gameId } = config;

    if (!(await this.canBeExecuted(gameId))) return;

    this.logger.log(`${this.getStepName()} for gameId ${gameId}`);
    config.stepStartDate = new Date();
    config.currentStep = this.getStepName();

    const startTime = Date.now();
    await this.execute(config);
    const endTime = Date.now();

    const sec = Math.round((endTime - startTime) / 10) / 100;
    this.logger.log(this.getStepName() + ' executed in: ' + sec + 's');
  }

  protected abstract execute(config: ParserConfigDto);

  protected abstract getStepName();

  protected abstract getProgress(config: ParserConfigDto);

  private async canBeExecuted(gameId: number): Promise<boolean> {
    if (await this.progressSrv.isPaused(gameId)) {
      this.logger.warn(`${this.getStepName()} for gameId ${gameId} is paused`);
      return false;
    }

    return true;
  }
}
