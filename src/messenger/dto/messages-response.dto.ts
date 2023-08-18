import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MessageDto } from './message-response.dto';

export class MessagesResponseDto {
  @ApiProperty()
  @Type(() => Number)
  total: number;

  @ApiProperty()
  @Type(() => MessageDto)
  messages: MessageDto[];

  constructor(partial?: Partial<MessagesResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
