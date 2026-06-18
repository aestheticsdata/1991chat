import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PasswordHasher } from '@application/auth/password-hasher.port';
import { User } from '@domain/user.entity';
import { UserRepository } from '@domain/ports/user-repository.port';
import { APP_CONFIG, AppConfig } from '@infrastructure/config/configuration';

/**
 * Seeds a default user on startup (if AUTH_DEFAULT_USERNAME/PASSWORD are set and
 * the user doesn't already exist), so you can log in immediately during dev.
 */
@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const { defaultUsername, defaultPassword } = this.config.auth;
    if (!defaultUsername || !defaultPassword) return;
    if (await this.users.findByUsername(defaultUsername)) return;

    await this.users.save(User.create(defaultUsername, await this.hasher.hash(defaultPassword)));
    this.logger.log(`Seeded default user "${defaultUsername}"`);
  }
}
