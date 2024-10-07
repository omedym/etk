import { Injectable, NestMiddleware } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryService } from './sentry.service';

type NextFunction = (error?: Error | any) => void;

@Injectable()
export class SetUserToSentryMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction): void {
    for (const headerKey in SentryService.headersToTags) {
      const valueSetToTag = req.get(headerKey) || req?.auth?.[headerKey];
      if (valueSetToTag) {
        Sentry.setTag(SentryService.headersToTags[headerKey], valueSetToTag);
      }
    }

    const userData: Record<string, string> = {};

    for (const headerKey in SentryService.headersToUser) {
      const valueSetToUser = req.get(headerKey) || req?.auth?.[headerKey];
      if (valueSetToUser) {
        userData[SentryService.headersToUser[headerKey]] = valueSetToUser;
      }
    }

    Sentry.setUser(userData);

    next();
  }
}
