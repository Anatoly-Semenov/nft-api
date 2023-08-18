import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { GameCode } from '../entities/game.entity';

export class GameDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  min_investment_token?: number;

  @ApiProperty()
  @Expose()
  token_title?: string;

  @ApiProperty()
  @Expose()
  release_date?: string;

  @ApiProperty()
  @Expose()
  chain_title?: string;

  @ApiPropertyOptional()
  @Expose()
  chains?: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  in_use?: boolean;

  @ApiProperty()
  @Expose()
  site: string;

  @ApiProperty()
  @Expose()
  image: string;

  @ApiPropertyOptional()
  @Expose()
  background_image?: string;

  @ApiProperty()
  @Expose()
  is_upcoming: boolean;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiProperty()
  @Expose()
  code: GameCode;

  @ApiProperty()
  @Expose()
  genre: string;

  constructor(partial?: Partial<GameDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
