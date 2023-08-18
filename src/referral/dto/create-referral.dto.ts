import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReferralDto {
  @ApiProperty()
  @Type(() => Number)
  senderId: number;

  @ApiProperty()
  @Type(() => Number)
  newUserId: number;

  constructor(partial?: Partial<CreateReferralDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
