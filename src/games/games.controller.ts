import * as fs from 'fs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GamesService } from './games.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GameDto } from './dto/game.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { AddGameAdditionalInfoDto } from './dto/add-game-additional-info.dto';
import { UpcomingGameDto } from './dto/upcoming-game.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Role } from 'src/users/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.emun';
import { ItemsListResponseDto } from 'src/common/dto/items-list-response.dto';
import { GetUpcomingGamesDto } from './dto/get-upcoming-games.dto';
import { AddSocialChannelDto } from 'src/socials/dto/add-social-channel.dto';
import { SocialChannel } from 'src/socials/entities/social-channel.entity';
import { GameAdditionalInfo } from './entities/game-additional-info.entity';
import { GetGamesListDto } from './dto/get-games-list.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GetGameInfoDto } from './dto/get-games-info.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameTokenContractDto } from './dto/game-token-contract.dto';
import { GamesInfoListItemDto } from './dto/games-info-list-item.dto';
import { GamesInfoDetailItemDto } from './dto/games-info-detail-item.dto';
import { GameMetadataDto } from './dto/game-metadata.dto';

@Controller('/games')
@ApiTags('Games')
@ApiBearerAuth()
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/list')
  @ApiResponse({
    status: 200,
    description: 'List of all services',
    type: GameDto,
    isArray: true,
  })
  findAll(@Query() getGamesListDto: GetGamesListDto): Promise<GameDto[]> {
    return this.gamesService.findAll(getGamesListDto);
  }

  @Get('/info')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    description: 'List all services with additional data',
    type: GamesInfoListItemDto,
    isArray: true,
  })
  getInfoList(@Query() query: GetGameInfoDto): Promise<GamesInfoListItemDto[]> {
    return this.gamesService.getGameInfoList(query);
  }

  @Get('/info/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Info about game with additional data by id',
    type: GamesInfoDetailItemDto,
  })
  getInfo(@Param('id') id: string): Promise<GamesInfoDetailItemDto> {
    return this.gamesService.getGameInfo(+id);
  }

  @Get('/info/:id/tokens')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Info about game tokens',
    type: GameTokenContractDto,
  })
  getGameTokens(@Param('id') id: string): Promise<GameTokenContractDto[]> {
    return this.gamesService.getGameTokensInfo(+id);
  }

  @Get('/upcoming')
  @ApiResponse({
    status: 200,
    description: 'List all upcoming games',
    type: UpcomingGameDto,
    isArray: true,
  })
  getUpcomingList(
    @Query() getUpcomingListDto: GetUpcomingGamesDto,
  ): Promise<ItemsListResponseDto<UpcomingGameDto>> {
    return this.gamesService.getUpcomingList(getUpcomingListDto);
  }

  @Get('/upcoming/:id')
  @ApiResponse({
    status: 200,
    description: 'Detail upcoming game',
    type: UpcomingGameDto,
  })
  getUpcomingGame(@Param('id') id: string): Promise<UpcomingGameDto> {
    return this.gamesService.getUpcomingGameById(Number(id));
  }

  @Get('/metadata')
  @ApiResponse({
    status: 200,
    description: 'List all games metadata',
    type: GameMetadataDto,
    isArray: true,
  })
  getMetadataList(): Promise<GameMetadataDto[]> {
    return this.gamesService.getMetadataList();
  }

  @Get('/metadata/:id.json')
  @ApiResponse({
    status: 200,
    description: 'Detail game metadata',
    type: GameMetadataDto,
  })
  getDetailMetadata(@Param('id') id: string): Promise<GameMetadataDto> {
    return this.gamesService.getDetailMetadata(Number(id));
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Add new game',
    type: GameDto,
  })
  @ApiBadRequestResponse({ description: 'Error creating game' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  createGame(@Body() createGameDto: CreateGameDto): Promise<GameDto> {
    return this.gamesService.create(createGameDto);
  }

  @Post('/:id/additional')
  @ApiCreatedResponse({ description: '', type: GameAdditionalInfo })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  addAdditionalInfo(
    @Param('id') id: string,
    @Body() addGameAdditionalInfoDto: AddGameAdditionalInfoDto,
  ): Promise<GameAdditionalInfo> {
    return this.gamesService.addAdditionalInfo(id, addGameAdditionalInfoDto);
  }

  @Post('/:id/socials')
  @ApiCreatedResponse({ description: '', type: SocialChannel })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  addSocialChannel(
    @Param('id') id: string,
    @Body() addSocialChannelDto: AddSocialChannelDto,
  ): Promise<SocialChannel> {
    return this.gamesService.addSocialChannel(id, addSocialChannelDto);
  }

  @Post('/import')
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
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.gamesService.importGamesCsv(file);
  }

  @Get('/export')
  @UseGuards(JwtAuthGuard)
  async exportGames(@Res() res: Response) {
    try {
      const path = await this.gamesService.exportGamesToCsv();
      const fileName = path.replace('./upload/', '');

      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.sendFile(fileName, { root: './upload/' }, (err) => {
        if (err) {
          res.status(404).end();
        }

        fs.unlinkSync(path);
      });
    } catch (error) {
      throw new BadRequestException(
        'Error exporting upcoming games',
        error.message,
      );
    }
  }

  @Post('/storage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiCreatedResponse({ description: 'Pushing games metadata to ipfs storage' })
  pushMetadataToIPFS(): Promise<{ folderURI: string }> {
    return this.gamesService.pushMetadata();
  }

  @Patch('/:id')
  @ApiOkResponse({ description: 'Update game by id' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  updateGame(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
  ): Promise<void> {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete('/:id')
  @ApiOkResponse({ description: 'Delete game by id' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  deleteGame(@Param('id') id: string): Promise<void> {
    return this.gamesService.delete(id);
  }

  @Delete('/:id/socials/:social')
  @ApiOkResponse({ description: 'Delete game social channel' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  deleteGameSocialChannel(
    @Param('id') id: string,
    @Param('social') social: string,
  ): Promise<void> {
    return this.gamesService.deleteSocialChannel(id, social);
  }
}
