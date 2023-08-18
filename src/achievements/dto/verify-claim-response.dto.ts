import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VerifyClaimResponseDto {
  @ApiProperty()
  @Type(() => String)
  signature: string;

  @ApiProperty()
  @Type(() => String)
  provider: string;

  @ApiProperty()
  @Type(() => String)
  userProviderId: string;

  @ApiProperty()
  @Type(() => String)
  mintAccount: string;

  @ApiProperty()
  @Type(() => Number)
  achievementTypeId: number;

  @ApiProperty()
  @Type(() => Number)
  collectionId: number;

  constructor(partial?: Partial<VerifyClaimResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
