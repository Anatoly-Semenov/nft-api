import { ApiProperty } from '@nestjs/swagger';

export class VerifySignDto {
  @ApiProperty()
  readonly walletAddress: string;

  @ApiProperty()
  readonly signature: string;

  @ApiProperty()
  readonly nonce: string;
}
