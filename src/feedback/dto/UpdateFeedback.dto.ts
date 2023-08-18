import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFeedbackDto {
  @ApiProperty()
  @Type(() => Boolean)
  viewed: boolean;

  constructor(partial?: Partial<UpdateFeedbackDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
