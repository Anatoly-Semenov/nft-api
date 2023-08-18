import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PlayerStatsService } from './player-stats.service';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerStats } from './entities/player-stats.entity';

@Controller('player-stats')
@ApiTags('Player statistic')
@ApiBearerAuth()
export class PlayerStatsController {
  constructor(private readonly playerStatsService: PlayerStatsService) {}

  @Get('/:gameId')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get game stats',
  })
  getStats(
    @Param('gameId') gameId: string,
    @GetUser() user: User,
  ): Promise<PlayerStats> {
    return this.playerStatsService.getStats(+gameId, user);
  }
}
