import { IMessageDefinition, IMessageData, IMessageMetadata, IUnknownMessageData, IMessage } from "./base";

export interface IRequestDefinition extends IMessageDefinition {
  messageType: 'command' | 'query' | 'task';
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
