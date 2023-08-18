import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DeepPartial } from 'src/types';
import { User } from 'src/users/entities/user.entity';
import { FeedbackData, FeedbackTypeList } from '../entities/Feedback.entity';

export class FeedbackDto {
  @ApiProperty()
  @Type(() => Number)
  id: number;

  @ApiProperty()
  @Type(() => String)
  type: FeedbackTypeList;

  @ApiProperty()
  @Type(() => Object)
  data: FeedbackData;

  @ApiPropertyOptional()
  @Type(() => User)
  creator?: User;

  @ApiProperty()
  @Type(() => Boolean)
  viewed: boolean;

  @ApiProperty()
  @Type(() => Date)
  updated_at: Date;

  @ApiProperty()
  @Type(() => Date)
  created_at: Date;

  constructor(partial?: DeepPartial<FeedbackDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
