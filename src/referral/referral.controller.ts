import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

// Decorators
import { GetUser } from 'src/users/decorators/get-user.decorator';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// Entity
import { User } from 'src/users/entities/user.entity';

// Services
import { ReferralService } from './referral.service';

// DTO
import { ListDto } from 'src/common/dto/list.dto';
import { QueryListDto } from 'src/common/dto/query-list.dto';
import { ReferralUserDto, TotalResponseDto } from './dto';

@ApiTags('Referral')
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('/users')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return referral users list',
    type: ReferralUserDto,
  })
  getReferralUsersList(
    @GetUser() user: User,
    @Query() query: QueryListDto,
  ): Promise<ListDto<ReferralUserDto>> {
    return this.referralService.getUsersList(user.id, query);
  }

  @Get('/total')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return referral total data',
    type: TotalResponseDto,
  })
  getReferralTotal(@GetUser() user: User): Promise<TotalResponseDto> {
    return this.referralService.getTotal(user.id);
  }
}
