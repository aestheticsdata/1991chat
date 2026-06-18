import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '@application/auth/password-hasher.port';

const SALT_ROUNDS = 10;

/** Password hashing with bcrypt. */
@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
