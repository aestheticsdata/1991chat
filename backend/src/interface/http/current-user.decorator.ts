import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/** The authenticated user, attached to the request by JwtAuthGuard. */
export interface AuthUser {
  id: string;
  username: string;
}

/** Convenience param decorator: `@CurrentUser() user: AuthUser`. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
  return request.user;
});
