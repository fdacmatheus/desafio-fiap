import { Injectable, Logger, OnApplicationBootstrap, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { runSeed } from './seeder';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get<string>('AUTO_SEED') !== 'true') return;

    this.logger.log('AUTO_SEED=true — executando seed (idempotente)');
    try {
      await runSeed({
        get: <T>(token: Type<T> | symbol | string): T =>
          this.moduleRef.get<T>(token as Type<T>, { strict: false }),
      });
    } catch (err) {
      this.logger.error(
        'Seed automático falhou',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
