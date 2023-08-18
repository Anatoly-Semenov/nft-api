import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateReferralDto } from './create-referral.dto';

export class ReferralDto extends CreateReferralDto {
  @ApiProperty()
  @Type(() => Number)
  id: number;

  constructor(partial?: Partial<ReferralDto>) {
    super();

    if (partial) {
      Object.assign(this, partial);
    }
  }
}
