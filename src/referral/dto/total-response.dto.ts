import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TotalResponseDto {
  @ApiProperty()
  @Type(() => Number)
  users: number;

  @ApiProperty()
  @Type(() => Number)
  balance: number;

  @ApiProperty()
  @Type(() => Number)
  achievements: number;

  constructor(partial?: Partial<TotalResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
