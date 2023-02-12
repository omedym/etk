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
    data: TData,
    metadata?: TMetadata,
  ): TMessage {
    const message: TMessage = {
      type: this.definition.cloudEvent.type,
      now: DateTime.now().toISO(),
      id: createId(),
      data,
      metadata: metadata ? metadata : DefaultMessageMetadata,
      specversion: '1.0',
      tenantid: '',
      source: '',
      context: {},
    } as unknown as TMessage;

    return message;
  }
}
