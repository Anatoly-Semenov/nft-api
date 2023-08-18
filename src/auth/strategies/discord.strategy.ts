import { UserSocialProfile } from '../../users/interfaces/user-social-profile.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email'],
    });
  }

  async validate(
    _accessToken,
    _refreshToken,
    profile,
    cb,
  ): Promise<UserSocialProfile> {
    const userProfile: UserSocialProfile = {
      id: profile.id,
      name: profile.username,
      email: profile.email,
      avatar: profile.avatar,
    };

    if (!userProfile.id) {
      throw new UnauthorizedException();
    }

    return cb(null, userProfile);
  }
}
