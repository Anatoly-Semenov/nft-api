import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { Role } from 'src/users/decorators/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { AchievementsService } from './achievements.service';
import { NftMetadataDto } from './dto/nft-metadata.dto';
import { VerifyClaimResponseDto } from './dto/verify-claim-response.dto';
import { VerifyClaimDto } from './dto/verify-claim.dto';

@Controller('nfts')
@ApiTags('Nfts')
@ApiBearerAuth()
export class AchievementNftsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get('/metadata')
  @ApiResponse({
    status: 200,
    description: 'List all nfts metadata',
    type: NftMetadataDto,
    isArray: true,
  })
  getMetadataList(): Promise<NftMetadataDto[]> {
    return this.achievementsService.getMetadataList();
  }

  @Get('/metadata/:id.json')
  @ApiResponse({
    status: 200,
    description: 'Detail nft metadata',
    type: NftMetadataDto,
  })
  getDetailMetadata(@Param('id') id: string): Promise<NftMetadataDto> {
    return this.achievementsService.getDetailMetadata(Number(id));
  }

  @Post('/storage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiCreatedResponse({ description: 'Pushing nfts metadata to ipfs storage' })
  pushMetadataToIPFS(): Promise<{ folderURI: string }> {
    return this.achievementsService.pushMetadata();
  }

  @Post('/:id/verify')
  @UseGuards(JwtAuthGuard)
  verifyNftClaim(
    @Param('id') id: string,
    @Body() verifyClaimDto: VerifyClaimDto,
    @GetUser() user: User,
  ): Promise<VerifyClaimResponseDto> {
    return this.achievementsService.verifyClaim(id, verifyClaimDto, user);
  }
}
