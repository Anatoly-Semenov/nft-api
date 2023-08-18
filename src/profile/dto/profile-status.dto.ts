import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProfileStatusDto {
  @ApiProperty()
  @Type(() => Boolean)
  achievementProcessing: boolean;

  constructor(partial?: Partial<ProfileStatusDto>) {
    partial && Object.assign(this, partial);
  }
}
