import { Module } from '@nestjs/common';
import { RavenModule } from 'nest-raven';
import { SentryService } from './sentry.service';
import { SentryApolloPlugin } from './sentry.apollo.plugin';

@Module({
  imports: [
    RavenModule,
  ],
  exports: [
    SentryService,
  ],
  providers: [
    SentryService,
    SentryApolloPlugin,
  ],
})
export class NestjsSentryModule { }
