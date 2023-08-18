import { ProgressStage } from '../enums/progress-stage.enum';

export class CreateProgressDto {
  readonly type: ProgressStage;
  readonly step: number = 1;
  readonly end: number;
  readonly gameId: number = -1;
  readonly start: number = null;
  readonly isIncremental: boolean = true;

  constructor(partial?: Partial<CreateProgressDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
