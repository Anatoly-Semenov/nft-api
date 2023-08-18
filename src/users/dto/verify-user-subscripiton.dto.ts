import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserSubscriptionDto {
  @ApiProperty()
  readonly signature: string;

  @ApiProperty()
  readonly discordId: string;
}
