import { ApiProperty } from '@nestjs/swagger';

export class SteamStatsResponseDto {
  @ApiProperty()
  appid: number;

  @ApiProperty()
  stats: Record<string, number>;

  @ApiProperty()
  achievements: Record<string, number>;
}
