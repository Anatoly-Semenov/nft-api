import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/users/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { CreateRewardDto } from './dto/create-reward.dto';
import { GetRewardsDto } from './dto/get-rewards.dto';
import { RewardsResponseDto } from './dto/rewards-response.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './entities/reward.entity';
import { RewardsService } from './rewards.service';

@Controller('rewards')
@ApiBearerAuth()
@ApiTags('Rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getRewards(
    @Query() getRewardsDto: GetRewardsDto,
  ): Promise<RewardsResponseDto> {
    return this.rewardsService.getList(getRewardsDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  addReward(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardsService.create(createRewardDto);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  updateReward(
    @Param('id') id: number,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<void> {
    return this.rewardsService.update(id, updateRewardDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  removeReward(@Param('id') id: number): Promise<void> {
    return this.rewardsService.delete(id);
  }
}
