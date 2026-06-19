import { Global, Module } from "@nestjs/common";
import { APP_CONFIG, loadConfig } from "@infrastructure/config/configuration";

/**
 * Global config module. `loadConfig` runs as a factory at startup; if a required
 * env var is missing it throws here and aborts the boot — that's the fail-fast
 * the plan calls for.
 */
@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useFactory: loadConfig }],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
