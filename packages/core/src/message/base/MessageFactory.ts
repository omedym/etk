import type { IMessage } from './Message';
import type { IMessageData } from './MessageData';
import type { IMessageDefinition } from './MessageDefinition';
import type { IMessageMetadata } from './MessageMetadata';

import Ajv from 'ajv';
import crypto from 'crypto';
import stableStringify from 'safe-stable-stringify';
import { DateTime } from 'luxon';
import { createId } from '@paralleldrive/cuid2';

import { DefaultMessageMetadata } from './MessageMetadata';


// type ExtractMessageData<M> = M extends IMessage<infer TData> ? TData : IMessageData;
// type ExtractMessageMetadata<M> = M extends IMessage<infer TMetadata> ? TMetadata: IMessageMetadata;

export abstract class AbstractMessageFactory<
  TData extends IMessageData,
  TMetadata extends IMessageMetadata,
  TMessage extends IMessage<TData, TMetadata>,
> {
  abstract definition: IMessageDefinition;
  abstract schema: object;

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
      time: DateTime.now().toISO(),
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

  seal(
    message: TMessage,
  ): TMessage {
    if(message.idempotencykey)
      return message;

    const verificationKey = crypto
      .createHash('md5')
      .update(stableStringify(message))
      .digest('hex');

    const sealedMessage = {
      ...message,
      idempotencykey: verificationKey,
    }

    return sealedMessage;
  }

  verify(
    message: TMessage,
  ): boolean {
    const { idempotencykey, ...unsealedMessage } = message;

    const verifiedKey = crypto
      .createHash('md5')
      .update(stableStringify(unsealedMessage))
      .digest('hex');

    return verifiedKey == idempotencykey;
  }

  validate(
    message: TMessage,
    throwOnError: boolean = false
  ): { isValid: boolean, errors: Ajv.ErrorObject[]} {
    const ajv = new Ajv();
    const validate = ajv.compile(this.schema)

    const valid = validate(message);

    if (valid) return { isValid: true, errors: [] };

    return { isValid: false, errors: validate.errors ?? []};
  }

}
