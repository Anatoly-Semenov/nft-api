import { ApiProperty } from '@nestjs/swagger';

export class ReadMessageRequestDto {
  @ApiProperty()
  readonly signature: string;
}
