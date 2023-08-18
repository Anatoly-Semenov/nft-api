import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GiveawayDto {
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

  @ApiProperty()
  @Expose()
  link_to_project: string;

  @ApiProperty()
  @Expose()
  prize_description: string;

  @ApiProperty()
  @Expose()
  link_to_join: string;

  @ApiProperty()
  @Expose()
  start_date: Date;

  @ApiProperty()
  @Expose()
  end_date: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;

  @ApiProperty()
  @Expose()
  created_at: Date;
}
