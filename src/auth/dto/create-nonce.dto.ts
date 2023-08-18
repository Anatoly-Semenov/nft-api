import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsEthereumAddress,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { IsSolanaPublicKey } from '../../common/decorators/IsSolanaPublicKey';
import { RegisterFromEnum } from '../../users/enums/register-from.enum';
import { Type } from 'class-transformer';

export class CreateNonceDto {
  @ApiPropertyOptional()
  @ValidateIf((obj, value) => !obj.solanaAccount || value)
  @IsEthereumAddress()
  walletAddress?: string;

  @ApiPropertyOptional()
  @ValidateIf((obj, value) => !obj.walletAddress || value)
  @IsSolanaPublicKey()
  readonly solanaAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  readonly referralId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(RegisterFromEnum, { each: true })
  readonly requestFrom?: RegisterFromEnum;
}
