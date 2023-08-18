import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReferralUserDto {
  @ApiProperty()
  @Type(() => Object)
  user: {
    id: number;
    displayedName: string;
    walletAddress: string;
    avatar: string;
  };

  @ApiProperty()
  @Type(() => Number)
  achievements: number;

  @ApiProperty()
  @Type(() => Number)
  games: number;

  @ApiProperty()
  @Type(() => Number)
  balance: number;

  @ApiProperty()
  @Type(() => Number)
  points: number;

  constructor(partial?: Partial<ReferralUserDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
