import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { Role } from 'src/users/decorators/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { AchievementsService } from './achievements.service';
import { AchievementProcessingDto } from './dto/achievement-processing.dto';
import { CreateAchievementRuleDto } from './dto/create-achievement-rule.dto';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { GetAchievementsDto } from './dto/get-achievements.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { AchievementProgress } from './entities/achievement-progress.entity';
import { Achievement } from './entities/achievement.entity';
import { SteamAchievement } from './entities/steam-achievement.entity';
import { AchievementsOnChainService } from './services/achievements-onchain.service';
import { Response } from 'express';
import * as fs from 'fs';
import { SteamAchievementsService } from './services/steam-achievements.service';

@Controller('achievements')
@ApiTags('Achievements')
@ApiBearerAuth()
export class AchievementsController {
  constructor(
    private achievementsService: AchievementsService,
    @Inject(AchievementsOnChainService.name)
    private readonly achievementsOnChainService: AchievementsOnChainService,
    private readonly steamAchievementsService: SteamAchievementsService,
  ) {}

  @Post('/csv-wallets')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{
    status: 'started' | 'finished' | 'in progress' | 'failed';
    message?: string;
  }> {
    return this.achievementsOnChainService.getAchievementsFromCsv(file);
  }

  @Get('/csv-achievements')
  async exportGames(@Res() res: Response) {
    try {
      const fileName = 'users-achievements-table.csv';

      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.sendFile(fileName, { root: './upload/' }, (err) => {
        if (err) {
          res.status(404).end();
        }

        try {
          fs.unlinkSync(`./upload/${fileName}`);
        } catch (error) {
          res.status(404).end();
        }
      });
    } catch (error) {
      throw new BadRequestException(
        'Error exporting upcoming games',
        error.message,
      );
    }
  }

  @Get('/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  getAchievementProgressList(): Promise<AchievementProgress[]> {
    return this.achievementsOnChainService.getAchievementProgressList();
  }

  @Get('/progress/current')
  @UseGuards(JwtAuthGuard)
  getAchievementProgressForCurrentUser(
    @GetUser() user: User,
  ): Promise<AchievementProgress> {
    return this.achievementsOnChainService.getAchievementProgress(user.id);
  }

  @Get('/progress/:user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  getAchievementProgress(
    @Param('user') userId: number,
  ): Promise<AchievementProgress> {
    return this.achievementsOnChainService.getAchievementProgress(userId);
  }

  @Get('/status-processing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  async statusProcessing(
    @Query() query: AchievementProcessingDto,
  ): Promise<boolean> {
    return this.achievementsService.statusProcessing(query);
  }

  // @Get('/start-processing')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Role(UserRole.ADMIN)
  // async startProcessing(@GetUser('id') userId: number): Promise<void> {
  @Get('/start-processing/:id')
  async startProcessing(@Param('id') id: string): Promise<void> {
    return this.achievementsService.startProcessing({ userId: +id });
  }

  @Get('/stop-processing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  async stopProcessing(): Promise<void> {
    return this.achievementsService.stopProcessing();
  }

  @Get('/achievement-rule-handlers')
  @ApiOkResponse({
    description: 'Get available list of achievement rule handlers',
    type: String,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  getAchievementRuleHandlers(): string[] {
    return this.achievementsService.getAchievementRuleHandlers();
  }

  @Get('/steam/:gameId')
  @ApiCreatedResponse({
    description: 'Parse steam achievements by game id',
    type: SteamAchievement,
    isArray: true,
  })
  parseSteamAchievementsByGame(
    @Param('gameId') gameId: number,
  ): Promise<SteamAchievement[]> {
    return this.steamAchievementsService.getListByGameId(gameId);
  }

  @Get()
  @ApiOkResponse({
    description: 'Get list of achievements',
    type: Achievement,
    isArray: true,
  })
  getAchievementList(
    @Query() getAchievementsDto: GetAchievementsDto,
  ): Promise<Achievement[]> {
    return this.achievementsService.getList(getAchievementsDto);
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get achievement by id',
    type: Achievement,
  })
  @ApiNotFoundResponse({ description: 'Achievement not found' })
  getAchievementById(@Param('id') id: string): Promise<Achievement> {
    return this.achievementsService.getById(id);
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Create achievement',
    type: Achievement,
  })
  @ApiBadRequestResponse({ description: 'Error creating achievement' })
  createAchievement(
    @Body() createAchievementDto: CreateAchievementDto,
  ): Promise<Achievement> {
    return this.achievementsService.create(createAchievementDto);
  }

  @Post('/:id/rules')
  @ApiCreatedResponse({
    description: 'Add achievement rule',
  })
  @ApiBadRequestResponse({ description: 'Error creating achievement rule' })
  addAchievementRule(
    @Param('id') id: string,
    @Body() createAchievementRuleDto: CreateAchievementRuleDto,
  ): Promise<void> {
    return this.achievementsService.addRule(id, createAchievementRuleDto);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Update achievement',
  })
  @ApiBadRequestResponse({ description: 'Error updating achievement' })
  updateAchievement(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ): Promise<void> {
    return this.achievementsService.update(id, updateAchievementDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Delete achievement',
  })
  @ApiBadRequestResponse({ description: 'Error updating achievement' })
  deleteAchievement(@Param('id') id: string): Promise<void> {
    return this.achievementsService.delete(id);
  }
}
