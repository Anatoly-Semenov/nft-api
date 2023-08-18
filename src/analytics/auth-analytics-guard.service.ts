import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AnalyticsService } from './analytics.service';

export const TOKEN_HEADER_NAME = 'api-key';

@Injectable()
export class AuthAnalyticsGuard implements CanActivate {
  constructor(private readonly analyticsService: AnalyticsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.header(TOKEN_HEADER_NAME);

    return this.analyticsService.isActiveClient(apiKey);
  }
}
