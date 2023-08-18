import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserSocialProfile } from 'src/users/interfaces/user-social-profile.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EpicGamesStrategy extends PassportStrategy(
  Strategy,
  'epic-games',
) {
  constructor(private jwtService: JwtService) {
    const clientID = process.env.EPIC_GAMES_CLIENT_ID;
    const clientSecret = process.env.EPIC_GAMES_CLIENT_SECRET;
    const header = Buffer.from(`${clientID}:${clientSecret}`).toString(
      'base64',
    );

    super({
      authorizationURL: 'https://www.epicgames.com/id/authorize',
      tokenURL: 'https://api.epicgames.dev/epic/oauth/v1/token',
      clientID,
      clientSecret,
      callbackURL: process.env.EPIC_GAMES_CALLBACK_URL,
      scope: ['basic_profile'],
      customHeaders: { Authorization: `Basic ${header}` },
    });
  }

  async validate(
    accessToken,
    _refreshToken,
    _profile,
    cb,
  ): Promise<UserSocialProfile> {
    const profile = this.jwtService.decode(accessToken) as Record<string, any>;

    const userProfile: UserSocialProfile = {
      id: profile.sub,
      name: profile.dn,
      email: '',
      avatar: '',
    };

    if (!userProfile.id) {
      throw new UnauthorizedException();
    }

    return cb(null, userProfile);
  }
}
