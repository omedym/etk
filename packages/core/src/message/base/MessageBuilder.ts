import type { IMessage } from './Message';
import type { IMessageData } from './MessageData';
import type { IMessageDefinition } from './MessageDefinition';
import type { IMessageMetadata } from './MessageMetadata';

import { createId } from '@paralleldrive/cuid2';
import Ajv from 'ajv';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import stableStringify from 'safe-stable-stringify';

import { decryptMessage, encryptMessage } from '@omedym/nestjs-dmq-repository-postgres';

import { DefaultMessageMetadata } from './MessageMetadata';

// type ExtractMessageData<M> = M extends IMessage<infer TData> ? TData : IMessageData;
// type ExtractMessageMetadata<M> = M extends IMessage<infer TMetadata> ? TMetadata: IMessageMetadata;

export abstract class AbstractMessageBuilder<
  TData extends IMessageData,
  TMetadata extends IMessageMetadata,
  TMessage extends IMessage<TData, TMetadata>,
> {
  abstract definition: IMessageDefinition;
  abstract schema: object;
  private message: TMessage;

  get(): TMessage {
    return this.message;
  }

  build(
    tenantId: string,
    source: string,
    data: TData,
    metadata?: TMetadata,
  ): AbstractMessageBuilder<TData, TMetadata, TMessage> {

    // When constructing the message we inject the provided tenantId across
    // all multiple concerns, specifically the event attribute `tenantid`, and
    // both a data payload and context payload attribute for `tenantId`.
    this.message = {
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

    return this;
  }

  seal(): AbstractMessageBuilder<TData, TMetadata, TMessage> {
    if (this.message.idempotencykey) return this;

    const verificationKey = crypto
      .createHash('md5')
      .update(stableStringify(this.message))
      .digest('hex');

    this.message.idempotencykey = verificationKey;

    return this;
  }

  verify(): boolean {
    const { idempotencykey, ...unsealedMessage } = this.message;

    const verifiedKey = crypto
      .createHash('md5')
      .update(stableStringify(unsealedMessage))
      .digest('hex');

    return verifiedKey == idempotencykey;
  }

  validate(): { isValid: boolean; errors: Ajv.ErrorObject[] } {
    const ajv = new Ajv();
    const validate = ajv.compile(this.schema);

    const valid = validate(this.message);

    if (valid) return { isValid: true, errors: [] };

    return { isValid: false, errors: validate.errors ?? [] };
  }

  setCorrelation(originMessage: TMessage): AbstractMessageBuilder<TData, TMetadata, TMessage> {
    this.message.metadata = {
      ...this.message.metadata,
      correlationId: originMessage.id,
      traceId: originMessage.metadata.traceId || originMessage.id,
    };

    return this;
  }
}
