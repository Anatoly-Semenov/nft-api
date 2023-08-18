import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameCode } from '../entities/game.entity';

export class CreateGameDto {
  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly genre: string;

  @ApiPropertyOptional()
  readonly logo?: string;

  @ApiProperty()
  readonly site: string;

  @ApiPropertyOptional()
  readonly min_investment_token?: number;

  @ApiProperty()
  readonly token_title: string;

  @ApiProperty()
  readonly release_date: string;

  @ApiProperty()
  readonly chain_title: string;

  @ApiProperty()
  readonly in_use: boolean;

  @ApiPropertyOptional({
    default: false,
  })
  readonly is_upcoming?: boolean;

  @ApiPropertyOptional({
    enum: GameCode,
  })
  readonly code?: GameCode;
}
