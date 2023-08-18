import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetGameInfoDto {
  @ApiPropertyOptional()
  @Type(() => Boolean)
  private readonly is_on_chain = true;
}
