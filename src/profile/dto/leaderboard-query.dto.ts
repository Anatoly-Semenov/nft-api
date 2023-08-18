import type { LeaderboardFilter, LeaderboardSort } from '../interfaces';
import { QueryListDto } from 'src/common/dto/query-list.dto';

export class LeaderboardQueryDto extends QueryListDto<
  LeaderboardSort,
  LeaderboardFilter
> {
  constructor(partial?: Partial<LeaderboardQueryDto>) {
    super();

    if (partial) {
      Object.assign(this, partial);
    }
  }
}
