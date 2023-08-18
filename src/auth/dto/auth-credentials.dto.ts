import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEthereumAddress, IsOptional, ValidateIf } from 'class-validator';
import { IsSolanaPublicKey } from '../../common/decorators/IsSolanaPublicKey';
import { Type } from 'class-transformer';

export class AuthCredentialsDto {
  @ApiPropertyOptional()
  @ValidateIf((obj, value) => !obj.solanaAccount || value)
  @IsEthereumAddress()
  readonly walletAddress?: string;

  @ApiPropertyOptional()
  @ValidateIf((obj, value) => !obj.walletAddress || value)
  @IsSolanaPublicKey()
  readonly solanaAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  readonly referralId?: number;

  @ApiPropertyOptional({ type: [Number] })
  @ValidateIf((obj, value) => !obj.walletAddress || value)
  readonly solanaSignature?: number[];
}
