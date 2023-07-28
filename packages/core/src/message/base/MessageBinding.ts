import { IMessageQueueDefinition } from './MessageQueue';
import { MessageDefinition, IMessage } from '..';


/**
 * Base interface for describing bindings between messages and queues, such
 * as an exchange, a gateway, or other consumer.
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
  toQueue: IMessageQueueDefinition;
}

/**
 * Sends messages to any associated queues and corresponding handlers based on the
 * message type.
 */
export interface IFanOutMessageBinding extends IBaseMessageBinding  {
  dir: 'out';
  toQueue: IMessageQueueDefinition[];
}

/**
 * Sends messages to queues and corresponding handlers depending on successful matches
 * between a message and the binding's pattern matcher.
 */
export interface ITopicMessageBinding<T extends IMessage = never> extends IBaseMessageBinding {
  dir: 'out';
  pattern: (message: T) => boolean;
  toQueue: IMessageQueueDefinition | IMessageQueueDefinition[];
}

export type InboundMessageBinding =
  | IAllowedMessageBinding
;

export type OutboundMessageBinding =
  | IDirectMessageBinding
  | IFanOutMessageBinding
  | ITopicMessageBinding
;

export type MessageBinding =
  | InboundMessageBinding
  | OutboundMessageBinding
;
