import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GameMetadataDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  logo: string;
}
