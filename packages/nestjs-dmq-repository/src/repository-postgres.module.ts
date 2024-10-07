import { DynamicModule, Module } from '@nestjs/common';

import { DefaultRepositoryPostgresServiceOptions, IRepositoryPostgresServiceOptions } from './postgres.options';

import { PrismaService } from './prisma.service';
import { providers } from './providers';

const prismaServiceFactory = (options: Partial<IRepositoryPostgresServiceOptions>) => {
  return {
    provide: providers.PRISMA,
    useFactory: () => {

      const prisma = new PrismaService({
        datasources: {
          db: {
            url: options.databaseUrl,
          },
        },
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'info',  emit: 'event' },
          { level: 'warn',  emit: 'event' },
        ],
      });

      return prisma;
    },
  };
};


@Module({})
export class RepositoryPostgresModule {
  static forRoot(options: Partial<IRepositoryPostgresServiceOptions>): DynamicModule {
    return {
      imports: [
      ],
      providers: [
        // Prisma
        prismaServiceFactory(options ?? DefaultRepositoryPostgresServiceOptions),
      ],
      exports: [
        providers.PRISMA,
      ],
      module: RepositoryPostgresModule,
    };
  }
}
