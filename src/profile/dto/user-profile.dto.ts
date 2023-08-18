import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserProfileDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  wallet: string;

  @ApiProperty()
  @Expose()
  total_achievements: number;

  @ApiProperty()
  @Expose()
  total_games: number;

  @ApiProperty()
  @Expose()
  avatar: string;
}
