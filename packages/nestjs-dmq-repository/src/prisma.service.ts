import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient, Prisma } from '@omedym/nestjs-dmq-datastore-client-postgres';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'info'| 'warn' | 'query' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

}
