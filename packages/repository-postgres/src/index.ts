
import { PrismaService } from './prisma.service';
import { providers } from './providers';

export * from '@omedym/nestjs-dmq-postgres-client';

export * from './TrackedQueueRepository';
export * from './postgres.connect';
export * from './postgres.options';
export * from './repository-postgres.module';
export * from './types';

export {
  PrismaService as PrismaPostgresService,
  providers as PostgresProviders,
}
