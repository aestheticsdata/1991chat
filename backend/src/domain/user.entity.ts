import { randomUUID } from "node:crypto";

/**
 * An application user. `passwordHash` is the stored credential (salt:hash); the
 * plaintext password never reaches the domain. Hashing/verification live in the
 * infrastructure PasswordService — the domain only carries the result.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
  ) {}

  static create(username: string, passwordHash: string): User {
    return new User(randomUUID(), username, passwordHash, new Date());
  }
}
