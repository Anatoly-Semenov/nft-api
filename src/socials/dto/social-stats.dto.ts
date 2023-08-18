import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SocialStatsDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  game_id: number;

  @ApiProperty()
  @Expose()
  channel_id: number;

  @ApiProperty()
  @Expose()
  members_count = 0;

  @ApiProperty()
  @Expose()
  members_online_count = 0;

  @ApiProperty()
  @Expose()
  posts_count = 0;

  @ApiProperty()
  @Expose()
  reposts_count = 0;

  @ApiProperty()
  @Expose()
  likes_count = 0;

  @ApiProperty()
  @Expose()
  comments_count = 0;

  @ApiProperty()
  @Expose()
  date: Date;

  constructor(partial?: Partial<SocialStatsDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
