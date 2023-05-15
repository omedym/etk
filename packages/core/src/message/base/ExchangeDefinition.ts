import type { MessageBinding } from './MessageBinding';
import { IQueueDefinition } from './QueueDefinition';

/**
 * IExchangeDefinition
 *
 * The base interface for defining a queue backed exchange and its message bindings.
 */
export interface IExchangeDefinition {
  queue: IQueueDefinition;
  bindings: MessageBinding[];
}
