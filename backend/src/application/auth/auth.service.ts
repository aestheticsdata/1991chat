import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "@domain/user.entity";
import { UserRepository } from "@domain/ports/user-repository.port";
import { PasswordHasher } from "@application/auth/password-hasher.port";

/**
 * Application service for authentication. Validates credentials and creates
 * users; it returns the domain User and does NOT touch the HTTP session — the
 * controller owns the session/cookie/CSRF concerns. Depends only on ports.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async register(username: string, password: string): Promise<User> {
    if (await this.users.findByUsername(username)) {
      throw new ConflictException("Username already taken");
    }
    const user = User.create(username, await this.hasher.hash(password));
    await this.users.save(user);
    return user;
  }

  async validateCredentials(username: string, password: string): Promise<User> {
    const user = await this.users.findByUsername(username);
    if (!user || !(await this.hasher.verify(password, user.passwordHash))) {
      // Same error for "no such user" and "wrong password" — don't leak which.
      throw new UnauthorizedException("Invalid username or password");
    }
    return user;
  }

  /**
   * Change the password of the (already authenticated) user; the current
   * password must match. A wrong current password is a 400 (not 401) so the
   * front's "401 means the session expired" redirect doesn't fire on a typo.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || !(await this.hasher.verify(currentPassword, user.passwordHash))) {
      throw new BadRequestException("Current password is incorrect");
    }
    await this.users.updatePassword(user.id, await this.hasher.hash(newPassword));
  }
}
