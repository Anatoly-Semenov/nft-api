import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserSubscriptionDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  wallet: string;

  @ApiProperty()
  @Expose()
  discordId: string;

  @ApiProperty()
  @Expose()
  subscriptionEndAt: Date;
}
