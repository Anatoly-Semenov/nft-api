import { Injectable } from '@nestjs/common';
import { BaseGamesAbstract } from './base-games-abstract.service';

export const SERVICE_UNKNOWN_GAME = 'SERVICE_UNKNOWN_GAME';

@Injectable()
export class UnknownGameService extends BaseGamesAbstract {
  protected getAnalyticsCommonRow() {
    return [];
  }

  protected getAnalyticsPlayerRow() {
    return [];
  }
}
