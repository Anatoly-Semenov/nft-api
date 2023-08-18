import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { UserSocialProfile } from 'src/users/interfaces/user-social-profile.interface';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      returnURL: process.env.STEAM_RETURN_URL,
      realm: process.env.STEAM_REALM,
      apiKey: process.env.STEAM_API_KEY,
    });
  }

  async validate(_accessToken, profile, cb): Promise<UserSocialProfile> {
    const userProfile: UserSocialProfile = {
      id: profile.id,
      name: profile.displayName,
      email: profile.email,
      avatar: profile._json.avatarfull || profile._json.avatar,
    };

    if (!userProfile.id) {
      throw new UnauthorizedException();
    }

    return cb(null, userProfile);
  }
}
