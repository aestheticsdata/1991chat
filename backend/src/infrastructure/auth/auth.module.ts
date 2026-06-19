import { Module } from "@nestjs/common";
import { AuthService } from "@application/auth/auth.service";
import { PasswordHasher } from "@application/auth/password-hasher.port";
import { AuthController } from "@interface/http/auth.controller";
import { BcryptPasswordHasher } from "@infrastructure/auth/bcrypt-password-hasher";
import { UserSeeder } from "@infrastructure/auth/user-seeder.service";

/**
 * Wires authentication. Sessions/cookies are handled by the express-session
 * middleware (main.ts) + RedisService (global), so this module only binds the
 * password hasher and the credential-validation service.
 */
@Module({
  controllers: [AuthController],
  providers: [{ provide: PasswordHasher, useClass: BcryptPasswordHasher }, AuthService, UserSeeder],
  exports: [AuthService],
})
export class AuthModule {}
