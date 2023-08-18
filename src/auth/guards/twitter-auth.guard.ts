import { ExecutionContext, Injectable } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class TwitterAuthGuard extends AuthGuard('twitter') {
  getAuthenticateOptions(context: ExecutionContext) {
    const httpContext: HttpArgumentsHost = context.switchToHttp();
    const req: Request = httpContext.getRequest<Request>();

    const serverURL = process.env.SERVER_API_URL;
    const params = new URLSearchParams();

    Object.keys(req.query)
      .filter((key) => key !== 'state' && key !== 'code')
      .forEach((key: string) => params.append(key, req.query[key].toString()));

    const callbackURL = `${serverURL}/users/socials/twitter?${params}`;

    return { callbackURL };
  }
}
