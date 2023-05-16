import { IMessageDefinition, IMessageData, IMessageMetadata, IUnknownMessageData, IMessage } from "./base";


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
