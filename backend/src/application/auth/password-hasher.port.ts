/**
 * PORT for password hashing. The application validates credentials through this
 * abstraction; the concrete algorithm (scrypt via node:crypto) lives in
 * infrastructure and can be swapped without touching auth logic.
 */
export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract verify(plain: string, hash: string): Promise<boolean>;
}
