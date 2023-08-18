import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from 'src/auth/constants';
import { User } from 'src/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (field: string, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();

    if (field) {
      if (
        (!request.user && field === 'id') ||
        field === 'hasMessengerAccess' ||
        (!request.user && field === 'walletAddress')
      ) {
        const headers = request.headers;

        if (headers) {
          try {
            let authToken =
              headers.authorization && headers.authorization.split(' ')[1];

            if (!authToken) {
              const cookies: string[] = headers.cookie.split('; ');
              authToken = cookies
                .find((cookie) => cookie.startsWith('accessToken'))
                .split('=')[1];
            }
            const payload: any = jwt.verify(authToken, jwtConstants.secret);

            if (field === 'id') return payload.sub;

            if (field === 'hasMessengerAccess')
              return payload.hasMessengerAccess;

            return payload.walletAddress;
          } catch (error) {
            return null;
          }
        }
      }

      if (request.user) {
        return request.user[field];
      }
    }

    return request.user;
  },
);
