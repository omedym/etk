import type { CloudEventV1 } from 'cloudevents';

import type { IMessageContext } from './MessageContext';
import type { IMessageData, IUnknownMessageData } from './MessageData';
import type { IMessageMetadata } from './MessageMetadata';

/**
 * IMessage
 *
 * The base interface for a message in an event driven architecture.
 *
 * This is a wrapper around a versioned interface, IMessageV1 to allow
 * for easier replacement and introduction of new versions of this
 * interface should the need arise.
 *
 * It leverages unifying concepts from CloudEvents and adds additional
 * custom extensions from prior experiences and other framework
 * interpretations.
 */
export interface IMessage<
  TData extends IMessageData = IUnknownMessageData,
  TMetadata extends IMessageMetadata = IMessageMetadata,
>
  extends IMessageV1<TData, TMetadata> { }

export interface IMessageV1<
  TData extends IMessageData = IUnknownMessageData,
  TMetadata extends IMessageMetadata = IMessageMetadata,
>
  extends CloudEventV1<TData>
{
  // IMPORTANT
  // Per the CloudEvent attribute naming convention, all top-level attributes to
  // include custom extensions MUST consist of lower-case letters ('a' to 'z')
  // or digits ('0' to '9)  from the ASCII character set. Attribute names SHOULD
  // be descriptive and terse and SHOULD NOT exceed 20 characters in length.
  // extension must be named in lowercase.
  // https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#attribute-naming-convention

  context: IMessageContext;

  data: TData;

  /**
   * @title idempotencykey
   *
   * @description
   * A deterministic idempotency key to support idempotent consumption by
   * clients when exactly-once message production/delivery cannot be
   * guaranteed.
   *
   * Calculate an MD5 content hash when sealing the final message.
   * ```
   *   idempotencykey = crypto
   *     .createHash('md5')
   *     .update(stableStringify(message))
   *     .digest('hex'); // 0800fc577294c34e0b28ad2839435945
   * ```
   * @example 0800fc577294c34e0b28ad2839435945
   */
  idempotencykey?: string;

  metadata: TMetadata;

  namespace?: string;

  /**
   * @default 1.0
   * @pattern /1.0/g
   */
  specversion: string;

  tenantid: string;
}
