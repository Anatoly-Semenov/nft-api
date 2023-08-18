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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetItemsListDto } from 'src/common/dto/get-items-list.dto';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { Role } from 'src/users/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { CreateFeedbackDto } from './dto/CreateFeedback.dto';
import { FeedbackDto } from './dto/Feedback.dto';
import { UpdateFeedbackDto } from './dto/UpdateFeedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('/feedback')
@ApiTags('Feedback')
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Create feedback message.',
    type: FeedbackDto,
  })
  create(
    @Body() body: CreateFeedbackDto,
    @GetUser('id') userId: string | undefined,
  ): Promise<FeedbackDto> {
    return this.feedbackService.create(userId && +userId, body);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get list of feedback messages.',
    type: ItemsListResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  getList(
    @Query() query: GetItemsListDto,
  ): Promise<ItemsListResponseDto<FeedbackDto>> {
    return this.feedbackService.getList(query);
  }

  @Delete()
  @ApiResponse({
    status: 200,
    description: 'Delete list of feedback messages.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  deleteList(@Query('ids') ids: string): Promise<void> {
    const feedbackIds = ids.split(',').map((id) => +id);

    return this.feedbackService.deleteManyByIds(feedbackIds);
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    description: 'Get feedback message by id.',
    type: FeedbackDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  getOne(@Param('id') feedbackId: string): Promise<FeedbackDto> {
    return this.feedbackService.getOne(+feedbackId);
  }

  @Delete('/:id')
  @ApiResponse({
    status: 200,
    description: 'Delete feedback message by id.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  deleteOne(@Param('id') feedbackId: string): Promise<void> {
    return this.feedbackService.deleteOneById(+feedbackId);
  }

  @Patch('/:id')
  @ApiResponse({
    status: 200,
    description: 'Update feedback message by id.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  updateOne(
    @Param('id') feedbackId: string,
    @Body() body: UpdateFeedbackDto,
  ): Promise<void> {
    return this.feedbackService.updateOne(+feedbackId, body);
  }
}
