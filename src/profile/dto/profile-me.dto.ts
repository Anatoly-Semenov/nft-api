import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProfileMeDto {
  @ApiProperty()
  @Type(() => Number)
  points: number;

  @ApiProperty()
  @Type(() => Number)
  level: number;

  @ApiProperty()
  @Type(() => String)
  image: string;

  @ApiProperty()
  @Type(() => Number)
  balance: number;

  constructor(partial?: Partial<ProfileMeDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
