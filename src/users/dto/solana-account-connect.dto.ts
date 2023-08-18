import { ApiProperty } from '@nestjs/swagger';
import { IsSolanaPublicKey } from '../../common/decorators/IsSolanaPublicKey';

export class SolanaAccountConnectDto {
  @ApiProperty()
  @IsSolanaPublicKey()
  readonly account?: string;

  @ApiProperty({ type: [Number] })
  readonly signature?: number[];
}
