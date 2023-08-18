import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateRewardDto {
  @ApiProperty()
  readonly name: string;

  @ApiPropertyOptional()
  readonly description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly amount?: number;

  @ApiPropertyOptional()
  readonly currency?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  readonly image?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  readonly link?: string;

  @ApiProperty()
  @IsISO8601()
  readonly startedAt: Date;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  readonly endedAt?: Date;
}
