import type { IMessage, IMessageDefinition } from './base/Message';
import type { IMessageData, IUnknownMessageData } from './base/MessageData';
import type { IMessageMetadata } from './base/MessageMetadata';


export interface IEventDefinition extends IMessageDefinition {
  messageType: 'event';
}

export interface IEventData extends IMessageData { }

/** @title EventMetadata */
export interface IEventMetadata extends IMessageMetadata { }

/**
 * IEvent
 *
 * The interface for Event messages.
 */
export interface IEvent<
  TData extends IEventData = IUnknownMessageData,
  TMetadata extends IEventMetadata = IEventMetadata,
>
  extends IMessage<TData, TMetadata> { }
