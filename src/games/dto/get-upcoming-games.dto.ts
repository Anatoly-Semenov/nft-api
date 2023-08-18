import { ApiPropertyOptional } from '@nestjs/swagger';
import { GetItemsListDto } from 'src/common/dto/get-items-list.dto';
import { UpcomingSortType } from '../enums/upcoming-sort-type.enum';

export class GetUpcomingGamesDto extends GetItemsListDto<UpcomingSortType> {
  @ApiPropertyOptional()
  readonly search?: string;
}
