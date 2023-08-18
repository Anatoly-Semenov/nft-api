import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEthereumAddress, IsOptional } from 'class-validator';

export class VerifyClaimDto {
  @ApiPropertyOptional()
  @IsEthereumAddress()
  @IsOptional()
  readonly walletAddress?: string;
}
