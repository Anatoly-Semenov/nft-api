import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MessageUserStatusEnum } from '../enums/message-user-status.enum';

export class MessageDto {
  @ApiProperty()
  @Type(() => Number)
  id: number;

  @ApiProperty()
  @Type(() => String)
  title: string;

  @ApiProperty()
  @Type(() => String)
  icon: string;

  @ApiProperty()
  @Type(() => String)
  preview: string;

  @ApiProperty()
  @Type(() => String)
  text: string;

  @ApiProperty()
  @Type(() => String)
  createdAt: string;

  @ApiProperty()
  @Type(() => Number)
  reward: number;

  @ApiProperty()
  @Type(() => String)
  status: MessageUserStatusEnum;

  constructor(partial?: Partial<MessageDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
