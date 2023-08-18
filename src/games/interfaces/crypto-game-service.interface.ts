import { MonthlyReturnDto } from '../dto/monthly-return.dto';
import { MarketInfoDto } from '../dto/market-info.dto';
import { GameDto } from '../dto/game.dto';

export interface ICryptoGameService {
  // getMonthlyReturn(game: GameDto): Promise<MonthlyReturnDto>;

  // getPlayersCount(game: GameDto): Promise<number>;

  getMarketInfo(game: GameDto): Promise<MarketInfoDto>;

  getEarnedLastDays(): Promise<number>;

  // getMinInvestment(game: GameDto): Promise<number>;

  // calculateApr(game: GameDto): Promise<number>;
}
