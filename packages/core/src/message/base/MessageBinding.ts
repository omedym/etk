import { IMessageExchangeDefinition } from './MessageExchange.definition';
import { MessageDefinition, Message } from '..';

/**
 * Base interface for describing bindings between messages and an exchange, such
 * as a gateway or other consumer.
 */
export interface IBaseMessageBinding {
  dir: 'in' | 'out';
  msg: MessageDefinition;
}

/**
 * Allows a message to be consumed by the given exchange. When used in conjunction
 * with gateways or consumers definitions and code generation a strongly typed
 * queue processor and switch will be created for directing this allowed
 * message to a corresponding message handler.
 *
*/
export interface IAllowedMessageBinding extends IBaseMessageBinding  {
  dir: 'in';
}

/**
 * Sends messages, generally a Command, to an associated queue and corresponding
 * handler based on the message type.
 */
export interface IDirectMessageBinding extends IBaseMessageBinding {
  dir: 'out';
  toQueue: IMessageExchangeDefinition | string;
}

/**
 * Sends messages to any associated queues and corresponding handlers based on the
 * message type.
 */
export interface IFanOutMessageBinding extends IBaseMessageBinding  {
  dir: 'out';
  toQueues: (IMessageExchangeDefinition | string)[];
}

/**
 * Sends messages to queues and corresponding handlers depending on successful matches
 * between a message and the binding's pattern matcher.
 */
export interface ITopicMessageBinding extends IBaseMessageBinding  {
  dir: 'out';
  pattern: <TMessage extends Message>(message: TMessage) => boolean;
  toSubscribers: (IMessageExchangeDefinition | string)[];
}

export type MessageBinding =
  | IAllowedMessageBinding
  | IDirectMessageBinding
  | IFanOutMessageBinding
  | ITopicMessageBinding
;
