import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AirdropStatus } from '../enums/airdrop-status.enum';

export class CreateAirdropDto {
  @ApiProperty()
  readonly name: string;

  @ApiPropertyOptional({
    enum: AirdropStatus,
    default: AirdropStatus.WHITELIST_STARTS,
  })
  readonly status: AirdropStatus;

  @ApiProperty()
  readonly startAt: Date;

  @ApiPropertyOptional()
  readonly description?: string;

  @ApiPropertyOptional()
  readonly image?: string;
}
