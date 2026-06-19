import { User } from "@domain/user.entity";

/**
 * OUTBOUND PORT for user persistence. Async on purpose: the current adapter is
 * synchronous SQLite, but keeping the contract Promise-based means swapping to
 * an async store later (Postgres, an HTTP service) requires no change here or in
 * the application layer.
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
  abstract updatePassword(id: string, passwordHash: string): Promise<void>;
}
