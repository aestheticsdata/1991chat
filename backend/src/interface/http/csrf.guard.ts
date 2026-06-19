import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Double-submit CSRF check. For unsafe,
 * authenticated requests the `x-csrf-token` header must match the token held in
 * the session. Safe methods and unauthenticated requests (login/register) pass
 * through untouched.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;

    const expected = req.session?.csrfToken;
    // No session / no token yet → nothing to protect (e.g. login, register).
    if (!req.session?.userId || !expected) return true;

    const header = req.headers["x-csrf-token"] ?? req.headers["x-xsrf-token"];
    const provided = Array.isArray(header) ? header[0] : header;
    if (!provided || provided !== expected) {
      throw new ForbiddenException("Invalid CSRF token");
    }
    return true;
  }
}
