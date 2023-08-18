import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from './enums/user-role.emun';
import { GetUser } from './decorators/get-user.decorator';
import { Role } from './decorators/roles.decorator';
import { UserSocials } from './enums/user-socials.enum';
import { UserSocialProfile } from './interfaces/user-social-profile.interface';
import { DiscordAuthGuard } from 'src/auth/guards/discord-auth.guard';
import { TwitterAuthGuard } from 'src/auth/guards/twitter-auth.guard';
import { EpicGamesAuthGuard } from 'src/auth/guards/epic-games-auth.guard';
import { AddAchievementDto } from './dto/add-achievement.dto';
import { UserSubscriptionDto } from './dto/user-subscription.dto';
import { VerifyUserSubscriptionDto } from './dto/verify-user-subscripiton.dto';
import { SteamAuthGuard } from 'src/auth/guards/steam-auth.guard';
import { UserBalanceDto } from './dto/user-balance.dto';
import { Response } from 'express';
import { ConnectUserSocialDto } from './dto/connect-user-social.dto';
import { SolanaAccountConnectDto } from './dto/solana-account-connect.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: User,
    isArray: true,
  })
  getUsersList(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Current user data',
    type: User,
    isArray: false,
  })
  getCurrentUser(@GetUser() user: User): User {
    delete user.achievements;
    delete user.wallets;

    return user;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Single user data',
    type: User,
    isArray: false,
  })
  getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get('/:id/balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Get user balance',
  })
  getUserBalance(@Param('id') id: number): Promise<UserBalanceDto> {
    return this.usersService.getBalance(id);
  }

  // @Get('/current/wallets')
  // @UseGuards(JwtAuthGuard)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Get list of current user wallets',
  //   type: UserWallet,
  //   isArray: true,
  // })
  // getCurrentUserWallets(@GetUser() user: User): Promise<UserWallet[]> {
  //   return this.usersService.findWalletList({ user });
  // }

  // @Get('/:id/wallets')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Role(UserRole.ADMIN)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Get list of wallets by user ID',
  //   type: UserWallet,
  //   isArray: true,
  // })
  // async getWalletsByUserId(@Param('id') id: string): Promise<UserWallet[]> {
  //   const user = await this.usersService.findById(id);
  //   return this.usersService.findWalletList({ user });
  // }

  @Get('/:wallet/subscription')
  @ApiResponse({
    status: 200,
    description: 'Get information about user subscription',
    type: UserSubscriptionDto,
    isArray: false,
  })
  getUserSubscriptionInfo(
    @Param('wallet') wallet: string,
    @Query('to_address') to_address?: string,
  ): Promise<UserSubscriptionDto> {
    return this.usersService.getUserSubscriptionInfo(wallet, to_address);
  }

  // @Post('/wallets')
  // pushUserWalletToSelfTable() {
  //   return this.usersService.pushUserWalletToSelfTable();
  // }

  //
  // @Post('/current/wallets')
  // @UseGuards(JwtAuthGuard)
  // @ApiResponse({
  //   status: 201,
  //   description: 'Add new wallet to current user',
  // })
  // addWalletToCurrent(
  //   @Body() addWalletDto: AddWalletDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.usersService.createWallet(addWalletDto.wallet, user);
  // }

  // @Post('/:id/wallets')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Role(UserRole.ADMIN)
  // @ApiResponse({
  //   status: 201,
  //   description: 'Add new wallet to user profile',
  // })
  // async addWalletToUser(
  //   @Param('id') id: string,
  //   @Body() addWalletDto: AddWalletDto,
  // ) {
  //   const user = await this.usersService.findById(id);

  //   return this.usersService.createWallet(addWalletDto.wallet, user);
  // }

  @Post('/:wallet/signature')
  @ApiResponse({
    status: 201,
    description: 'Verify user subscription',
  })
  verifyUserSubscription(
    @Param('wallet') wallet: string,
    @Body() verifyUserSubscriptionDto: VerifyUserSubscriptionDto,
  ): Promise<{ status: 'success' | 'fail' }> {
    return this.usersService.verifyUserSubscription(
      wallet,
      verifyUserSubscriptionDto,
    );
  }

  @Post('/:wallet/subscription-trial')
  @ApiResponse({
    status: 201,
    description: 'Verify trial user subscription',
  })
  verifyTrialUserSubscription(
    @Param('wallet') wallet: string,
    @Body() verifyUserSubscriptionDto: VerifyUserSubscriptionDto,
  ): Promise<{ status: 'success' | 'fail' }> {
    return this.usersService.verifyTrialUserSubscription(
      wallet,
      verifyUserSubscriptionDto,
    );
  }

  @Post('/:id/discord')
  @UseGuards(DiscordAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  connectDiscord(
    @Param('id') id: string,
    @GetUser() profile: UserSocialProfile,
  ): Promise<User> {
    return this.usersService.connectSocial(id, UserSocials.DISCORD, profile);
  }

  @Get('/socials/twitter')
  @UseGuards(TwitterAuthGuard)
  async connectTwitterById(
    @Query() connectUserSocialDto: ConnectUserSocialDto,
    @GetUser() profile: UserSocialProfile,
    @Res() res: Response,
  ) {
    const { userId, redirectUrl } = connectUserSocialDto;
    await this.usersService.connectSocial(userId, UserSocials.TWITTER, profile);

    res.redirect(redirectUrl || 'https://app.skilllabs.io/profile');
  }

  @Post('/:id/twitter')
  @UseGuards(TwitterAuthGuard)
  connectTwitter(
    @Param('id') id: string,
    @GetUser() profile: UserSocialProfile,
  ): Promise<User> {
    return this.usersService.connectSocial(id, UserSocials.TWITTER, profile);
  }

  @Post('/:id/epic-games')
  @UseGuards(EpicGamesAuthGuard)
  connectEpicGames(
    @Param('id') id: string,
    @GetUser() profile: UserSocialProfile,
  ): Promise<User> {
    return this.usersService.connectSocial(id, UserSocials.EPIC_GAMES, profile);
  }

  @Post('/:id/steam')
  @UseGuards(SteamAuthGuard)
  connectSteam(
    @Param('id') id: string,
    @GetUser() profile: UserSocialProfile,
  ): Promise<User> {
    return this.usersService.connectSocial(id, UserSocials.STEAM, profile);
  }

  // @Post('/:id/claimedNfts')
  // @UseGuards(JwtAuthGuard)
  // @ApiResponse({
  //   status: 201,
  //   description: 'Claim NFT',
  // })
  // claimNft(
  //   @Param('id') id: string,
  //   @Body() claimNftDto: ClaimNftDto,
  // ): Promise<void> {
  //   return this.usersService.claimNft(id, claimNftDto);
  // }

  @Post('/:id/achievements')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Claim NFT',
  })
  addAchievement(
    @Param('id') id: string,
    @Body() addAchievementDto: AddAchievementDto,
  ): Promise<void> {
    return this.usersService.addAchievement(id, addAchievementDto);
  }

  @Post('/:id/balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Add user balance',
  })
  addUserBalance(
    @Param('id') id: number,
    @Body() addUserBalanceDto: UserBalanceDto,
  ): Promise<UserBalanceDto> {
    return this.usersService.addBalanceRecord(id, addUserBalanceDto);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
  })
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.usersService.update(id, updateUserDto, user);
  }

  //
  // @Patch('/:id/wallets/:wallet')
  // @UseGuards(JwtAuthGuard)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Verify user added wallet',
  // })
  // verifyWallet(
  //   @Param('wallet') wallet: string,
  //   @Body() verifyUserSignDto: VerifyUserSignDto,
  //   @GetUser() user: User,
  // ): Promise<{ status: 'success' | 'fail' }> {
  //   return this.usersService.verifyWallet(wallet, verifyUserSignDto, user);
  // }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @Role(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
  })
  deleteUser(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.usersService.remove(id, user);
  }

  @Get('/nonce/create')
  @ApiResponse({
    status: 200,
  })
  @UseGuards(JwtAuthGuard)
  async createNonce(@GetUser() user: User): Promise<{ nonce: string }> {
    const nonce = await this.usersService.createNonce(user);
    return { nonce: UsersService.getMessageForSign(nonce) };
  }

  @Post('/wallet/connect/solana-account')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Add new solana account to user profile',
  })
  async addSolanaAccount(
    @GetUser() user: User,
    @Body() solanaAccountConnectDto: SolanaAccountConnectDto,
  ): Promise<{ result: boolean }> {
    const result = await this.usersService.addSolanaAccount(
      solanaAccountConnectDto.account,
      solanaAccountConnectDto.signature,
      user,
    );

    return {
      result,
    };
  }

  // @Delete('/:id/wallets/:wallet')
  // @UseGuards(JwtAuthGuard)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Delete user wallet address',
  // })
  // deleteWallet(
  //   @Param('wallet') wallet: string,
  //   @GetUser() user: User,
  // ): Promise<void> {
  //   return this.usersService.deleteWallet(wallet, user);
  // }
}
