import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SocialChannelDto } from 'src/socials/dto/social-channel.dto';
import { GameExtendedCommunitiesDto } from './game-extended.dto';

export class UpcomingGameDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  image: string;

  @ApiPropertyOptional()
  @Expose()
  pictures?: string[];

  @ApiPropertyOptional()
  @Expose()
  video?: string[];

  @ApiProperty()
  @Expose()
  genre: string;

  @ApiPropertyOptional()
  @Expose()
  backers?: string;

  @ApiPropertyOptional()
  @Expose()
  chains?: string;

  @ApiPropertyOptional()
  @Expose()
  ido_platforms?: string;

  @ApiPropertyOptional()
  @Expose()
  ido_status?: string;

  @ApiPropertyOptional()
  @Expose()
  release_status?: string;

  @ApiProperty()
  @Expose()
  site: string;

  @ApiProperty()
  @Expose()
  is_upcoming: boolean;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiProperty()
  @Expose()
  token: string;

  @ApiProperty()
  @Expose()
  ido_date: Date;

  @ApiProperty()
  @Expose()
  ido_date_estimation: string;

  @ApiProperty()
  @Expose()
  marketplace: string;

  @ApiProperty()
  @Expose()
  ino_date: Date;

  @ApiProperty()
  @Expose()
  ino_date_estimation: string;

  @ApiPropertyOptional()
  @Expose()
  ino_status?: string;

  @ApiProperty()
  @Expose()
  release_date: Date;

  @ApiProperty()
  @Expose()
  release_date_estimation: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => GameExtendedCommunitiesDto)
  communities?: GameExtendedCommunitiesDto;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => SocialChannelDto)
  links?: SocialChannelDto;
}
