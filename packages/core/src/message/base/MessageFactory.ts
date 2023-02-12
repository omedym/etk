import type { IMessage } from './Message';
import type { IMessageData } from './MessageData';
import type { IMessageDefinition } from './MessageDefinition';
import { IMessageMetadata, DefaultMessageMetadata } from './MessageMetadata';

import { DateTime } from 'luxon';
import { createId } from '@paralleldrive/cuid2';

export abstract class AbstractMessageFactory<
  TData extends IMessageData,
  TMetadata extends IMessageMetadata,
  TMessage extends IMessage<TData, TMetadata>,
> {
  abstract definition: IMessageDefinition;

  build(
    tenantId: string,
    source: string,
    data: TData,
    metadata?: TMetadata,
  ): TMessage {
    // When constructing the message we inject the provided tenantId across
    // all multiple concerns, specifically the event attribute `tenantid`, and
    // both a data payload and context payload attribute for `tenantId`.
    const message: TMessage = {
      type: this.definition.cloudEvent.type,
      now: DateTime.now().toISO(),
      id: createId(),
      data: {
        ...data,
        tenantId: tenantId,
      },
      metadata: metadata ? metadata : DefaultMessageMetadata,
      specversion: '1.0',
      tenantid: tenantId,
      source: source,
      context: {
        tenantId: tenantId,
      },
    } as unknown as TMessage;

    return message;
  }
}
