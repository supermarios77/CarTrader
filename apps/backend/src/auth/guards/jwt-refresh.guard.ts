import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(
    err: Error | null,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ) {
    // If token is missing or invalid, let the service handle the error
    // This allows DTO validation to run first
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.body?.refreshToken;

    if (!refreshToken) {
      // Return null to let ValidationPipe handle the missing token error
      return null;
    }

    // If there's an error or no user, return null to let service handle it
    if (err || !user) {
      return null;
    }

    return user;
  }
}

