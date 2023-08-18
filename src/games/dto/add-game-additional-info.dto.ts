import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class AddGameAdditionalInfoDto {
  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  pictures?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  video?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  platforms?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  marketplace?: string;

  @ApiPropertyOptional()
  token?: string;

  @ApiPropertyOptional()
  @IsOptional()
  token_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  token_price?: string;

  @ApiPropertyOptional()
  @IsOptional()
  backers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  chains?: string;

  @ApiPropertyOptional()
  @IsOptional()
  ido_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  ino_date?: string;
}
