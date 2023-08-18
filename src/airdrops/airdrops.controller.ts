import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AirdropsService } from './airdrops.service';
import { CreateAirdropDto } from './dto/create-airdrop.dto';
import { GetAirdropListDto } from './dto/get-airdrop-list.dto';
import { UpdateAirdropDto } from './dto/update-airdrop.dto';
import { Airdrop } from './entities/airdrop.entity';

@Controller('airdrops')
@ApiTags('Airdrops')
@ApiBearerAuth()
export class AirdropsController {
  constructor(private airdropsService: AirdropsService) {}

  @Get()
  @ApiOkResponse({
    description: 'Get list of airdrops',
    type: Airdrop,
    isArray: true,
  })
  getAirdropList(
    @Query() getAirdropListDto: GetAirdropListDto,
  ): Promise<Airdrop[]> {
    return this.airdropsService.getList(getAirdropListDto);
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Get airdrop by id', type: Airdrop })
  @ApiNotFoundResponse({ description: 'Airdrop not found' })
  getAirdropById(@Param('id') id: string): Promise<Airdrop> {
    return this.airdropsService.getById(id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Create airdrop', type: Airdrop })
  @ApiBadRequestResponse({ description: 'Error creating airdrop' })
  createAirdrop(@Body() createAirdropDto: CreateAirdropDto): Promise<Airdrop> {
    return this.airdropsService.create(createAirdropDto);
  }

  @Patch('/:id')
  @ApiOkResponse({ description: 'Update airdrop' })
  @ApiBadRequestResponse({ description: 'Error updating airdrop' })
  updateAirdrop(
    @Param('id') id: string,
    @Body() updateAirdropDto: UpdateAirdropDto,
  ): Promise<void> {
    return this.airdropsService.update(id, updateAirdropDto);
  }

  @Delete('/:id')
  @ApiOkResponse({ description: 'Delete airdrop' })
  @ApiBadRequestResponse({ description: 'Error deleting airdrop' })
  deleteAirdrop(@Param('id') id: string): Promise<void> {
    return this.airdropsService.delete(id);
  }
}
