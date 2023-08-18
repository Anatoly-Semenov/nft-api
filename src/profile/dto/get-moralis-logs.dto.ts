import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEthereumAddress, IsNumber, IsOptional } from 'class-validator';

export class GetMoralisLogsDto {
  @ApiPropertyOptional()
  @IsEthereumAddress()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: string;
}
