import { Expose, Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { Game } from '../entities/game.entity';

export class GetGameListOptionsDto {
  @Type(() => String)
  @IsArray()
  relations?: string[];

  @Type(() => String)
  @IsArray()
  select?: Array<keyof Game>;

  @Type(() => Game)
  where?: Partial<Game>;

  @Expose({ name: 'limit' })
  @Type(() => Number)
  take?: number;

  @Expose({ name: 'offset' })
  @Type(() => Number)
  skip?: number;

  constructor(partial?: Partial<GetGameListOptionsDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
