import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserSocialProfile } from 'src/users/interfaces/user-social-profile.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  private logger = new Logger(TwitterStrategy.name);

  constructor(
    private readonly httpService: HttpService,
    private moduleRef: ModuleRef,
  ) {
    const clientID = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const header = Buffer.from(`${clientID}:${clientSecret}`).toString(
      'base64',
    );

    super({
      authorizationURL: 'https://twitter.com/i/oauth2/authorize',
      tokenURL: 'https://api.twitter.com/2/oauth2/token',
      clientID,
      clientSecret,
      scope: ['users.read', 'tweet.read', 'follows.write'],
      customHeaders: { Authorization: `Basic ${header}` },
      state: true,
      pkce: true,
      clientType: 'private',
      passReqToCallback: true,
    });
  }

  async validate(
    _request: Request,
    accessToken,
    _refreshToken,
    _profile,
    cb,
  ): Promise<void> {
    const url = 'https://api.twitter.com/2/users';
    const res = await firstValueFrom(
      this.httpService.get(`${url}/me?user.fields=profile_image_url,url`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    const user = res.data.data;

    if (!user) {
      throw new UnauthorizedException();
    }

    try {
      if (process.env.TWITTER_MAIN_ACCOUNT) {
        const followRes = await firstValueFrom(
          this.httpService.post(
            `${url}/${user.id}/following`,
            {
              target_user_id: process.env.TWITTER_MAIN_ACCOUNT,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          ),
        );

        const { data } = followRes.data;

        if (data.following) {
          this.logger.log(`${user.name} followed to our twitter account`);
        }
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }

    try {
      if (process.env.TWITTER_MAIN_ACCOUNT) {
        const followRes = await firstValueFrom(
          this.httpService.post(
            `${url}/${user.id}/following`,
            {
              target_user_id: process.env.TWITTER_MAIN_ACCOUNT,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          ),
        );

        const { data } = followRes.data;

        if (data.following) {
          this.logger.log(`${user.name} followed to our twitter account`);
        }
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }

    const userProfile: UserSocialProfile = {
      id: user.id,
      name: user.name,
      email: '',
      avatar: user.profile_image_url,
    };

    try {
      if (process.env.TWITTER_MAIN_ACCOUNT) {
        const followRes = await firstValueFrom(
          this.httpService.post(
            `${url}/${user.id}/following`,
            {
              target_user_id: process.env.TWITTER_MAIN_ACCOUNT,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          ),
        );

        const { data } = followRes.data;

        if (data.following) {
          this.logger.log(`${user.name} followed to our twitter account`);
        }
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }

    return cb(null, userProfile);
  }
}
