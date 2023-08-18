import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { Role } from 'src/users/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { GetGiveawayListDto } from './dto/get-giveaway-list.dto';
import { GiveawayDto } from './dto/giveaway.dto';
import { GiveawayService } from './giveaways.service';

@Controller('/giveaways')
@ApiTags('Giveaways')
@ApiBearerAuth()
export class GiveawaysController {
  constructor(private readonly giveawaysService: GiveawayService) {}

  @Get('/list')
  @ApiResponse({
    status: 200,
    description: 'Get list of giveaway entities',
    type: GiveawayDto,
    isArray: true,
  })
  getGiveawayList(): Promise<GiveawayDto[]> {
    return this.giveawaysService.getGiveawayList();
  }

  @Get('/list-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Get all list of giveaway entities',
    isArray: true,
  })
  getGiveawayListAll(
    @Query() { offset, limit }: GetGiveawayListDto,
  ): Promise<ItemsListResponseDto<GiveawayDto>> {
    limit = +limit;
    offset = +offset;

    return this.giveawaysService.getGiveawayListAll({
      take: limit,
      skip: offset,
    });
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Create a new giveaway entity',
    type: GiveawayDto,
  })
  @ApiBody({ type: GiveawayDto })
  createGiveaway(
    @Body() payload: Omit<GiveawayDto, 'id'>,
  ): Promise<GiveawayDto> {
    return this.giveawaysService.createGiveaway(payload);
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    description: 'Get one giveaway entity by id',
    type: GiveawayDto,
  })
  getGiveaway(@Param('id') giveawayId: string): Promise<GiveawayDto> {
    return this.giveawaysService.getGiveawayById(+giveawayId);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Delete one giveaway entity',
    type: Boolean,
  })
  removeGiveaway(@Param('id') giveawayId: string): Promise<boolean> {
    return this.giveawaysService.removeGiveawayById(+giveawayId);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Update one giveaway by id',
    type: GiveawayDto,
  })
  @ApiBody({ type: GiveawayDto })
  updateGiveaway(
    @Param('id') giveawayId: string,
    @Body() payload: Omit<GiveawayDto, 'id'>,
  ): Promise<GiveawayDto> {
    return this.giveawaysService.updateGiveawayById(+giveawayId, payload);
  }
}
