import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class IsAllowedMaticAirdropDto {
  @ApiProperty()
  @Type(() => Boolean)
  isAllowed: boolean;

  constructor(partial?: Partial<IsAllowedMaticAirdropDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
