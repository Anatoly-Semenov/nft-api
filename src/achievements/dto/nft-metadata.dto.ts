import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NftMetadataDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  image: string;

  @ApiProperty()
  @Expose()
  game: string;
}
