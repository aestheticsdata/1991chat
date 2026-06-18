import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/user.entity';
import { UserRepository } from '@domain/ports/user-repository.port';
import { SQLITE, SqliteDatabase } from '@infrastructure/persistence/sqlite/database';

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: number;
}

/** SQLite adapter for UserRepository. Maps rows ↔ domain User. */
@Injectable()
export class SqliteUserRepository extends UserRepository {
  constructor(@Inject(SQLITE) private readonly db: SqliteDatabase) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? this.toUser(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username) as UserRow | undefined;
    return row ? this.toUser(row) : null;
  }

  async save(user: User): Promise<void> {
    this.db
      .prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)')
      .run(user.id, user.username, user.passwordHash, user.createdAt.getTime());
  }

  private toUser(row: UserRow): User {
    return new User(row.id, row.username, row.password_hash, new Date(row.created_at));
  }
}
