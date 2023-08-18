import { AnalyticsInfoRequestDto } from '../dto/analytics-info-request.dto';

export interface IAnalyticsGameService {
  getPlayersData(requestDto: AnalyticsInfoRequestDto, userId: number);

  getCommonData(requestDto: AnalyticsInfoRequestDto, userId: number);
}
