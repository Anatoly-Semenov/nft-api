import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AirdropMaticService } from './services/airdrop-matic.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { IsAllowedMaticAirdropDto } from './dto/is-allowed-matic-airdrop.dto';
import { SendMaticAirdropDto } from './dto/send-matic-airdrop.dto';

@Controller('airdrop-matic')
@ApiTags('Airdrop Matic')
@ApiBearerAuth()
export class AirdropMaticController {
  constructor(private airdropMaticService: AirdropMaticService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Send free MATIC to user',
    type: SendMaticAirdropDto,
  })
  @UseGuards(JwtAuthGuard)
  async send(@GetUser('id') userId: number): Promise<SendMaticAirdropDto> {
    return {
      transactionHash: await this.airdropMaticService.send(userId),
    };
  }

  @Get('is-allowed')
  @ApiResponse({
    status: 200,
    description: 'Check is allowed MATIC airdrop',
    type: IsAllowedMaticAirdropDto,
  })
  @UseGuards(JwtAuthGuard)
  async isAllowed(
    @GetUser('id') userId: number,
  ): Promise<IsAllowedMaticAirdropDto> {
    return {
      isAllowed: await this.airdropMaticService.isAllowedGetMatic(userId),
    };
  }
}
