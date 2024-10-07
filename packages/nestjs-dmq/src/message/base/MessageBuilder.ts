import type { IMessage } from './Message';
import type { IMessageContext } from './MessageContext';
import type { IMessageData, IUnknownMessageData } from './MessageData';
import type { IMessageDefinition } from './MessageDefinition';
import type { IMessageMetadata } from './MessageMetadata';

import { createId } from '@paralleldrive/cuid2';
import Ajv from 'ajv';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import stableStringify from 'safe-stable-stringify';

import { decryptMessage, encryptMessage } from '@omedym/nestjs-dmq-repository';

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

  private context?: IMessageContext;
  private data?: TData;
  private metadata?: Partial<TMetadata>;
  private source?: string;
  private tenantId?: string;

  private vaultKeyId?: string;
  private secretKey?: string;

  // TODO: buildAndEncrypt() ?
  // TODO: sendOrPublish() ?
  // TODO: strong abstract message with embedded builder factory ??

  build(
    opts?: {
      encrypt?: boolean;
      validate?: boolean;
      seal?: boolean;
      throwOnError?: boolean,
    },
  ): TMessage {

    const encrypt = opts?.encrypt ?? true;
    const validate = opts?.validate ?? true;
    const seal = opts?.seal ?? true;
    const throwOnError = opts?.throwOnError ?? false;

    // TODO: Add checks for valid attributes like tenantId before we build message

    // When constructing the message we inject the provided tenantId across
    // all multiple concerns, specifically the event attribute `tenantid`, and
    // both a data payload and context payload attribute for `tenantId`.
    const message: TMessage = {
      id: createId(),
      time: DateTime.now().toISO(),
      type: this.definition.cloudEvent.type,

      specversion: '1.0',
      source: this.source,
      tenantid: this.tenantId,

      context: {
        ...this.context,
        tenantId: this.tenantId,
      },
      data: {
        ...this.data,
        tenantId: this.tenantId,
      },
      metadata: this.metadata ?? DefaultMessageMetadata,
    } as unknown as TMessage;

    if (validate)
      this.validate(message, { throwOnError });

    if (!this.definition.encryption || !encrypt)
      return seal ? this.seal(message) : message;

    if (!this.vaultKeyId || !this.secretKey)
      throw new Error (`Message encryption required: ${this.definition.cloudEvent.type}`);

    const encrypted = this.encrypt(message, this.vaultKeyId, this.secretKey);

    return seal ? this.seal(encrypted) : encrypted;
  }

  with(
    tenantId: string,
    source: string,
    data: TData,
  ): this {
    this.tenantId = tenantId;
    this.source = source;
    this.data = data;

    return this;
  }

  withContext(context: IMessageContext): this {
    this.context = this.context
      ? { ...this.context, ...context }
      : { ...context} satisfies IMessageContext

    return this;
  }

  withEncryption(
    vaultKeyId: string,
    secretKey: string
  ): this {

    if (!this.definition.encryption)
      throw new Error (`Message encryption not supported: ${this.definition.cloudEvent.type}`);

    this.vaultKeyId = vaultKeyId;
    this.secretKey = secretKey;

    return this;
  }

  withMetadata(metadata: TMetadata): this {
    this.metadata = this.metadata
      ? { ...this.metadata, ...metadata }
      : { ...metadata} satisfies TMetadata;

    return this;
  }

  seal(message: TMessage): TMessage {
    if (message.idempotencykey)
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

  verify(message: TMessage): boolean {
    const { idempotencykey, ...unsealedMessage } = message;

    const verifiedKey = crypto
      .createHash('md5')
      .update(stableStringify(unsealedMessage))
      .digest('hex');

    return verifiedKey == idempotencykey;
  }

  validate(
    message: TMessage,
    opts: { throwOnError: boolean } = { throwOnError: false }
  ): { isValid: true } | { isValid: false, errors: Ajv.ErrorObject[]} {
    const ajv = new Ajv();
    const validate = ajv.compile(this.schema)

    const valid = validate(message);

    if (valid)
      return { isValid: true };

    if (opts.throwOnError) {
      const error = validate.errors?.shift();
      const errorMsg = `${error?.schemaPath} ${error?.message}`;
      throw new Error(`Message validation failed: ${errorMsg}`, { cause: validate.errors });
    }

    return { isValid: false, errors: validate.errors ?? []};
  }

  correlateWith(originMessage: IMessage): this {
    const correlationMetadata = {

      correlationId: originMessage.id,
      traceId: originMessage.metadata?.traceId || originMessage.id,
    };

    this.metadata = this.metadata
      ? { ...this.metadata, ...correlationMetadata }
      : { ...correlationMetadata } as Partial<TMetadata>;

    return this;
  }

  encrypt(
    message: TMessage,
    vaultKeyId: string,
    secretKey: string,
  ): TMessage {
    if (message.vaultkeyid) return message;

    if (!this.definition.encryption) {
      throw new Error(`Message encryption schema missing: ${this.definition.cloudEvent.type}`);
    }

    const encryptedMessage: TMessage = {
      ...message,
      vaultkeyid: vaultKeyId,
    }
    const data: IUnknownMessageData = encryptedMessage.data;

    if (this.definition.encryption.encryptMetadata) {
      const valueToEncrypt: string = stableStringify(data);
      const encryptedData = encryptMessage({ message: valueToEncrypt, key: secretKey });
      (encryptedMessage.data as any) = encryptedData.message;
    } else {

      for (let key in this.definition.encryption) {
        if (!Object.hasOwn(this.definition.encryption, key)) {
          continue;
        }

        let valueToEncrypt: unknown = data[key];

        if (!valueToEncrypt) {
          continue;
        }

        if (this.definition.encryption[key].type !== 'string') {
          valueToEncrypt = stableStringify(valueToEncrypt);
        }

        const encryptedData = encryptMessage({ message: valueToEncrypt as string, key: secretKey });

        (encryptedMessage.data as IUnknownMessageData)[key] = encryptedData.message;
      }
    }

    return encryptedMessage;
  }

  decrypt(
    message: TMessage,
    secretKey: string,
  ): TMessage {
    if (!message.vaultkeyid) return message;

    if (!this.definition.encryption) {
      throw new Error(`Message encryption schema undefined: ${this.definition.cloudEvent.type}`);
    }

    const { vaultkeyid, ...decryptedMessage } = message;
    const data: IUnknownMessageData = (decryptedMessage as TMessage).data;

    if (this.definition.encryption.encryptMetadata) {
      const valueToDecrypt: unknown = data;
      const decryptedData = decryptMessage({ message: valueToDecrypt as string, key: secretKey });
      (decryptedMessage.data as any) = JSON.parse(decryptedData.message);
    } else {

      for (let key in this.definition.encryption) {
        if (!Object.hasOwn(this.definition.encryption, key)) {
          continue;
        }

        const valueToDecrypt: unknown = data[key];

        if (!valueToDecrypt) {
          continue;
        }

        const decryptedData = decryptMessage({ message: valueToDecrypt as string, key: secretKey });

        if (this.definition.encryption[key].type !== 'string') {
          (decryptedMessage.data as IUnknownMessageData)[key] = JSON.parse(decryptedData.message);
        } else {
          (decryptedMessage.data as IUnknownMessageData)[key] = decryptedData.message;
        }
      }
    }

    return decryptedMessage as TMessage;
  }
}
