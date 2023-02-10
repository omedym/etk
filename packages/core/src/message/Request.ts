import type { IMessage, IMessageDefinition } from './base/Message';
import type { IMessageData, IUnknownMessageData } from './base/MessageData';
import type { IMessageMetadata } from './base/MessageMetadata';


export interface IRequestDefinition extends IMessageDefinition {
  messageType: 'command' | 'query';
}

export interface IRequestData extends IMessageData {}

export interface IRequestMetadata extends IMessageMetadata {}

/**
 * IRequest
 *
 * The interface for Request messages.
 */
export interface IRequest<
  TData extends IRequestData = IUnknownMessageData,
  TMetadata extends IRequestMetadata = IRequestMetadata,
>
  extends IMessage<TData, TMetadata> { }
