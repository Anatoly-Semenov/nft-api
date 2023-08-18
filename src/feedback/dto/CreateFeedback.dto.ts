import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FeedbackTypeList, FeedbackData } from '../entities/Feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty()
  @Type(() => String)
  type: FeedbackTypeList;

  @ApiProperty()
  @Type(() => Object)
  data: FeedbackData;
}
