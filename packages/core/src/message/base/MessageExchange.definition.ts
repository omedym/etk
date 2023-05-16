import type { MessageBinding } from './MessageBinding';
import { IMessageQueueDefinition } from './MessageQueue.definition';

/**
 * IExchangeDefinition
 *
 * The base interface for defining a queue backed exchange and its message bindings
 * which are used to determine what it can accept inbound and any special
 * handling for outbound.
 */
export interface IMessageExchangeDefinition {
  queue: IMessageQueueDefinition;
  bindings: MessageBinding[];
}
