import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SocialServiceList } from '../entities/social-channel.entity';

export class SocialChannelDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  game_id: number;

  @ApiProperty()
  @Expose()
  channel: string;

  @ApiProperty()
  @Expose()
  service: SocialServiceList;
}
