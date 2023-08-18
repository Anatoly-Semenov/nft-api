import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserSignDto {
  @ApiProperty()
  readonly signature: string;

  @ApiProperty()
  readonly nonce: string;
}
