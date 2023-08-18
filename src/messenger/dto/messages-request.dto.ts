import { ApiProperty } from '@nestjs/swagger';
import { MessageUserStatusEnum } from '../enums/message-user-status.enum';

export class MessagesRequestDto {
  @ApiProperty({
    type: MessageUserStatusEnum,
  })
  status: MessageUserStatusEnum;

  @ApiProperty({
    type: Number,
  })
  page: number;
}
