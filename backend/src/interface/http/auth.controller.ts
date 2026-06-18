import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '@application/auth/auth.service';
import { LoginDto, RegisterDto } from '@application/dto/auth.dto';
import { User } from '@domain/user.entity';
import { RedisService } from '@infrastructure/redis/redis.service';
import { CsrfGuard } from '@interface/http/csrf.guard';
import { generateCsrfToken } from '@interface/http/csrf.util';
import { AuthUser, CurrentUser } from '@interface/http/current-user.decorator';
import { SessionAuthGuard } from '@interface/http/session-auth.guard';

interface AuthResponse {
  user: AuthUser;
  csrfToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly redis: RedisService,
  ) {}

  /** Create an account and open a session (auto sign-in). */
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthResponse> {
    const user = await this.auth.register(dto.username, dto.password);
    return this.establishSession(req, user);
  }

  /** Verify credentials and open a session. */
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthResponse> {
    const user = await this.auth.validateCredentials(dto.username, dto.password);
    return this.establishSession(req, user);
  }

  /** Echo the current user + the active CSRF token (used to (re)hydrate the front). */
  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@CurrentUser() user: AuthUser, @Req() req: Request): AuthResponse {
    return { user, csrfToken: req.session.csrfToken ?? '' };
  }

  /** Rotate and return a fresh CSRF token (called by the front after a 403). */
  @Get('csrf')
  @UseGuards(SessionAuthGuard)
  csrf(@Req() req: Request): { csrfToken: string } {
    const csrfToken = generateCsrfToken();
    req.session.csrfToken = csrfToken;
    return { csrfToken };
  }

  /** Destroy the session (real server-side logout) and clear the cookie. */
  @Post('logout')
  @HttpCode(200)
  @UseGuards(SessionAuthGuard, CsrfGuard)
  logout(@Req() req: Request): Promise<{ ok: boolean }> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve({ ok: true })));
    });
  }

  /**
   * Store identity + a fresh CSRF token in the session, persist it, then clear
   * the user's other sessions (one active session per user).
   */
  private async establishSession(req: Request, user: User): Promise<AuthResponse> {
    req.session.userId = user.id;
    req.session.username = user.username;
    const csrfToken = generateCsrfToken();
    req.session.csrfToken = csrfToken;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
    await this.redis.clearOtherUserSessions(user.id, req.sessionID);

    return { user: { id: user.id, username: user.username }, csrfToken };
  }
}
