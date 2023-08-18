import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SocialServiceList } from '../entities/social-channel.entity';

export class SocialSessionDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  service: SocialServiceList;

  @ApiProperty()
  @Expose()
  session: string;

  @ApiProperty()
  @Expose()
  updated_at: Date;

  @ApiProperty()
  @Expose()
  created_at: Date;
}
