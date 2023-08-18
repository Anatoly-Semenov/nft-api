import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// Decorators
import { GetUser } from 'src/users/decorators/get-user.decorator';

// Service
import { ProfileService } from './profile.service';

// DTO
import { AchievementDto } from 'src/achievements/dto/achievement.dto';
import {
  ProfileGameDto,
  ProfileGameAchievementDto,
  ProfileGamesDto,
  ProfileMeDto,
  GetProfileGamesDto,
  ProfileStatusDto,
  ProfileAchievementGameDto,
  UserProfileDto,
  LeaderboardDto,
  LeaderboardQueryDto,
} from './dto';

// Entity
import { User } from 'src/users/entities/user.entity';
import { ListDto } from '../common/dto/list.dto';

@Controller('/profile')
@ApiBearerAuth()
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/games/:id/achievements')
  @ApiResponse({
    status: 200,
    description: 'Get profile achievements by game.',
    type: AchievementDto,
    isArray: true,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getNfts(
    @Param('id') gameId: string,
    @GetUser('id') userId?: number,
  ): Promise<AchievementDto[]> {
    // throw new BadRequestException('Deprecated');
    return this.profileService.getGameAchievements(+gameId, +userId);
  }

  @Get('/me')
  @ApiResponse({
    status: 200,
    description: 'Get my profile info.',
    type: ProfileMeDto,
  })
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('id') userId: number): Promise<ProfileMeDto> {
    return this.profileService.getMe(userId);
  }

  @Get('/achievements')
  @ApiResponse({
    status: 200,
    description: 'Get list of games & achievements',
    type: ProfileGameAchievementDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  getAchievements(@GetUser() user: User): Promise<ProfileGameAchievementDto[]> {
    return this.profileService.getAchievements(user);
  }

  @Get('/earned-achievements')
  @ApiResponse({
    status: 200,
    description: 'Get list of earned achievements',
    type: AchievementDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  getEarnedAchievements(@GetUser() user: User): Promise<AchievementDto[]> {
    return this.profileService.getEarnedAchievements(user);
  }

  @Get('/game-list')
  @ApiResponse({
    status: 200,
    description: 'Get list of games with achievements',
    type: ProfileAchievementGameDto,
    isArray: true,
  })
  getGameList(
    @GetUser('id') userId?: number,
  ): Promise<ProfileAchievementGameDto[]> {
    return this.profileService.getGameListWithAchievements(userId);
  }

  @Get('/stats')
  @ApiResponse({
    status: 200,
    description: 'Get list of games with stats: earn & spend.',
    type: ProfileGamesDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async getStats(
    @GetUser('id') userId: number,
    @Query() query: GetProfileGamesDto,
  ): Promise<ProfileGamesDto> {
    return this.profileService.getGameList(userId, query);
  }

  @Get('/stats/:id')
  @ApiResponse({
    status: 200,
    description: 'Get list of games with stats: earn & spend.',
    type: ProfileGamesDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async getStatsForGame(
    @Param('id') gameId: number,
    @GetUser('id') userId: number,
  ): Promise<ProfileGameDto> {
    return this.profileService.getGameInfo(gameId, userId);
  }

  @Get('/status')
  @ApiResponse({
    status: 200,
    description: 'Get status of profile services.',
    type: ProfileStatusDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async getStatus(@GetUser('id') userId: number): Promise<ProfileStatusDto> {
    return this.profileService.getStatus(userId);
  }

  @Get('/leaderboard')
  @ApiResponse({
    status: 200,
    description: 'Get leaderboard list.',
    type: LeaderboardDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getLeaderboard(
    @Query() query: LeaderboardQueryDto,
    @GetUser('id') myUserId: string,
  ): Promise<ListDto<LeaderboardDto>> {
    return this.profileService.getLeaderboard(query, myUserId);
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    description: 'Get user data for profile',
    type: UserProfileDto,
  })
  getUserProfile(@Param('id') userId: number): Promise<UserProfileDto> {
    return this.profileService.getUserProfile(userId);
  }

  @Get('/:id/achievements')
  @ApiResponse({
    status: 200,
    description: 'Get profile achievements by user',
    type: ProfileGameAchievementDto,
    isArray: true,
  })
  getUserProfileAchievements(
    @Param('id') userId: number,
  ): Promise<ProfileGameAchievementDto[]> {
    return this.profileService.getUserProfileAchievements(userId);
  }
}
