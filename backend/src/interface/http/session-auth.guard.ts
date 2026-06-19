import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthUser } from "@interface/http/current-user.decorator";

/**
 * Lets a request through only if it carries a valid server-side session
 * (`req.session.userId`, looked up from Redis by the sid cookie) and attaches
 * the user to the request. No token verification — the session middleware
 * already validated the cookie.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const userId = req.session?.userId;
    if (!userId) throw new UnauthorizedException("Session required");
    req.user = { id: userId, username: req.session.username ?? "" };
    return true;
  }
}
