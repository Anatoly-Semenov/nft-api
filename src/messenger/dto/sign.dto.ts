import { ApiProperty } from '@nestjs/swagger';

export class SignDto {
  @ApiProperty()
  readonly walletAddress: string;

  @ApiProperty()
  readonly signature: string;
}
