import { ApiProperty } from '@nestjs/swagger';

export class AddWalletDto {
  @ApiProperty()
  readonly wallet: string;
}
