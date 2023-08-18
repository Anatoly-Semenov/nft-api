import { DiscordAuthGuard } from './guards/discord-auth.guard';
import { AuthService } from './auth.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateNonceDto } from './dto/create-nonce.dto';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { FakeAuthDto } from './dto/fake-auth.dto';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { UserSocialProfile } from 'src/users/interfaces/user-social-profile.interface';
import { VerifySignDto } from './dto/verify-sign.dto';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';
import { EpicGamesAuthGuard } from './guards/epic-games-auth.guard';
import { SteamAuthGuard } from './guards/steam-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/discord')
  @UseGuards(DiscordAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  authByDiscord() {
    // return this.authService.validateUser(authCredentialsDto);
  }

  @Get('/discord/callback')
  @UseGuards(DiscordAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  discordCallback(@GetUser() profile: UserSocialProfile): Promise<AuthTokens> {
    // Disable registration by social
    // return this.authService.signInBySocial(UserSocials.DISCORD, profile);
    return null;
  }

  @Get('/twitter')
  @UseGuards(TwitterAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  authByTwitter() {
    // return this.authService.validateUser(authCredentialsDto);
  }

  @Get('/twitter/callback')
  @UseGuards(TwitterAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  twitterCallback(@GetUser() profile: UserSocialProfile): Promise<AuthTokens> {
    // Disable registration by social
    // return this.authService.signInBySocial(UserSocials.TWITTER, profile);
    return null;
  }

  @Get('/epic-games')
  @UseGuards(EpicGamesAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  authByEpicGames() {
    // return this.authService.validateUser(authCredentialsDto);
  }

  @Get('/epic-games/callback')
  @UseGuards(EpicGamesAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  epicGamesCallback(
    @GetUser() profile: UserSocialProfile,
  ): Promise<AuthTokens> {
    // Disable registration by social
    // return this.authService.signInBySocial(UserSocials.EPIC_GAMES, profile);
    return null;
  }

  @Get('/steam')
  @UseGuards(SteamAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  authBySteam() {
    // return this.authService.validateUser(authCredentialsDto);
  }

  @Get('/steam/callback')
  @UseGuards(SteamAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  steamCallback(@GetUser() profile: UserSocialProfile): Promise<AuthTokens> {
    // Disable registration by social
    // return this.authService.signInBySocial(UserSocials.STEAM, profile);
    return null;
  }

  @Post('/fake')
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  fakeSignin(@Body() fakeAuthDto: FakeAuthDto): Promise<AuthTokens> {
    return this.authService.fakeValidate(fakeAuthDto);
  }

  @Post('/signin')
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<AuthTokens> {
    return this.authService.validateUser(authCredentialsDto);
  }

  @Post('/nonce')
  @ApiResponse({
    status: 200,
    description: 'Generate unique nonce for user',
  })
  async createNonce(
    @Body() createNonceDto: CreateNonceDto,
  ): Promise<{ nonce: string }> {
    const { nonce } = await this.authService.createNonce(createNonceDto);

    return { nonce };
  }

  @Post('/signature')
  @ApiResponse({ status: 200, description: 'Verify user signature' })
  verifySign(
    @Body() verifySignDto: VerifySignDto,
  ): Promise<{ status: 'success' | 'fail' }> {
    return this.authService.verifySign(verifySignDto);
  }
}
