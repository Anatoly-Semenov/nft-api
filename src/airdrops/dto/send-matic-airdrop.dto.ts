import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SendMaticAirdropDto {
  @ApiProperty()
  @Type(() => String)
  transactionHash: string;

  constructor(partial?: Partial<SendMaticAirdropDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
