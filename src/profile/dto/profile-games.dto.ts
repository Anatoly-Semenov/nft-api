import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { ProfileGameDto } from './profile-game.dto';

class ProfileGamesTotalDto {
  @ApiProperty()
  @Type(() => Number)
  spending: number;

  @ApiProperty()
  @Type(() => Number)
  earning: number;
}

export class ProfileGamesDto implements ItemsListResponseDto<ProfileGameDto> {
  @ApiProperty()
  @Type(() => ProfileGamesTotalDto)
  total: ProfileGamesTotalDto;

  @ApiProperty()
  @Type(() => ProfileGameDto)
  @IsArray()
  items: ProfileGameDto[];

  @ApiProperty()
  @Type(() => Number)
  count: number;

  constructor(partial?: Partial<ProfileGamesDto>) {
    partial && Object.assign(this, partial);
  }
}
