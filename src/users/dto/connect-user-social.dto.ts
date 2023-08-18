import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ConnectUserSocialDto {
  @ApiProperty()
  readonly userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly redirectUrl?: string;
}
