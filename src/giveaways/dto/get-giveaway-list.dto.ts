import { ApiProperty } from '@nestjs/swagger';

export class GetGiveawayListDto {
  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;
}
