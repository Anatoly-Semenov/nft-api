import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SocialStatsDto } from './social-stats.dto';

export class SocialStatsExtendedDto extends SocialStatsDto {
  @ApiProperty()
  @Expose()
  members_growth: number;

  @ApiProperty()
  @Expose()
  members_growth_percentage: number;

  @ApiProperty()
  @Expose()
  members_online_growth: number;

  @ApiProperty()
  @Expose()
  members_online_growth_percentage: number;

  @ApiProperty()
  @Expose()
  posts_growth: number;

  @ApiProperty()
  @Expose()
  posts_growth_percentage: number;

  @ApiProperty()
  @Expose()
  reposts_growth: number;

  @ApiProperty()
  @Expose()
  reposts_growth_percentage: number;

  @ApiProperty()
  @Expose()
  likes_growth: number;

  @ApiProperty()
  @Expose()
  likes_growth_percentage: number;

  @ApiProperty()
  @Expose()
  comments_growth: number;

  @ApiProperty()
  @Expose()
  comments_growth_percentage: number;

  constructor(partial?: Partial<SocialStatsExtendedDto>) {
    super();

    if (partial) {
      Object.assign(this, partial);
    }
  }
}
