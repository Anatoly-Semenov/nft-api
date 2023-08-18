import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Reward } from '../entities/reward.entity';

export class RewardsResponseDto {
  @ApiProperty()
  @Type(() => String)
  link: string;

  @ApiProperty()
  @Type(() => String)
  date: string;

  @ApiProperty()
  @Type(() => Reward)
  list: Reward[];

  constructor(partial?: Partial<RewardsResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
