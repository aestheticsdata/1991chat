// Load .env FIRST — before any module is imported — so config and the
// LLM_PROVIDER switch in LlmModule see the values.
import 'dotenv/config';
import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { AppModule } from './app.module';
import { APP_CONFIG, AppConfig } from '@infrastructure/config/configuration';
import { RedisService } from '@infrastructure/redis/redis.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<AppConfig>(APP_CONFIG);

  const redis = app.get(RedisService);
  await redis.connect();

  // Behind the BFF/nginx; trust X-Forwarded-* so secure cookies work in prod.
  app.set('trust proxy', 1);
  app.use(
    session({
      name: config.session.cookieName,
      secret: config.session.secret,
      store: new RedisStore({
        client: redis.client,
        prefix: config.session.redisPrefix,
        ttl: config.session.ttlSeconds,
      }),
      resave: false,
      saveUninitialized: false,
      rolling: true, // refresh TTL on activity
      cookie: {
        httpOnly: true,
        secure: config.session.cookieSecure,
        sameSite: 'lax',
        maxAge: config.session.ttlSeconds * 1000,
      },
    }),
  );

  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.enableShutdownHooks();

  await app.listen(config.port);
  new Logger('Bootstrap').log(
    `Backend on http://localhost:${config.port} (LLM_PROVIDER=${config.llm.provider}, sessions in Redis)`,
  );
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend:', error instanceof Error ? error.message : error);
  process.exit(1);
});
