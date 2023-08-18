import { ApiProperty } from '@nestjs/swagger';

export class FakeAuthDto {
  @ApiProperty()
  id: string;
}
