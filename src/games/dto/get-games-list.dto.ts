import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetGamesListDto {
  @ApiPropertyOptional()
  readonly is_upcoming?: boolean;
}
