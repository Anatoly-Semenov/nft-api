import { ApiPropertyOptional } from '@nestjs/swagger';
import { GetItemsListDto } from 'src/common/dto/get-items-list.dto';

export class GetProfileGamesDto extends GetItemsListDto {
  @ApiPropertyOptional({
    type: Boolean,
    default: true,
  })
  is_on_chain: boolean;
}
