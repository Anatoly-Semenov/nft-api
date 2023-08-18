import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { jwtConstants } from './constants';

// Controllers
import { AuthController } from './auth.controller';

// Modules
import { UsersModule } from 'src/users/users.module';
import { GamesModule } from 'src/games/games.module';
import { ReferralModule } from 'src/referral/referral.module';

// Strategies
import { SteamStrategy } from './strategies/steam.strategy';
import { TwitterStrategy } from './strategies/twitter.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';
import { EpicGamesStrategy } from './strategies/epic-games.strategy';

// Services
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    ReferralModule,
    GamesModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    HttpModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    DiscordStrategy,
    TwitterStrategy,
    EpicGamesStrategy,
    SteamStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
