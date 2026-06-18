import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { APP_CONFIG, AppConfig } from '@infrastructure/config/configuration';

/**
 * Owns the Redis connection. Used both as the express-session store backend
 * (in main.ts) and to enforce one-active-session-per-user.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: RedisClientType;
  readonly sessionPrefix: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.client = createClient({ url: config.redis.url });
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err instanceof Error ? err.message : String(err)}`),
    );
    this.sessionPrefix = config.session.redisPrefix;
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.close(); // v6 renamed quit() → close()
  }

  /**
   * Delete every session belonging to `userId` except `keepSid` — this is what
   * makes "logging in invalidates your other sessions" work.
   *
   * node-redis v6 `scanIterator` yields a BATCH of keys (string[]) per
   * iteration, so we mGet the batch and del the matches in one round-trip each.
   */
  async clearOtherUserSessions(userId: string, keepSid: string): Promise<void> {
    const keepKey = this.sessionPrefix + keepSid;
    for await (const keys of this.client.scanIterator({
      MATCH: `${this.sessionPrefix}*`,
      COUNT: 100,
    })) {
      if (keys.length === 0) continue;
      const raws = await this.client.mGet(keys);
      const toDelete = keys.filter((key, i) => {
        if (key === keepKey) return false;
        const raw = raws[i];
        if (!raw) return false;
        try {
          return (JSON.parse(raw) as { userId?: string }).userId === userId;
        } catch {
          return false; // ignore malformed / non-session entries
        }
      });
      if (toDelete.length) await this.client.del(toDelete);
    }
  }
}
