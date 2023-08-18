import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Achievement } from 'src/achievements/entities/achievement.entity';

export class ProfileNftDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  shortDescription: string;

  @ApiProperty()
  @Expose()
  chain?: string;

  @ApiProperty()
  @Expose()
  image: string;

  @ApiProperty()
  @Expose()
  count: number;

  @ApiProperty()
  @Expose()
  expiredAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt?: Date;

  @ApiProperty()
  @Expose()
  achievements: Achievement[];

  constructor(partial?: Partial<ProfileNftDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
