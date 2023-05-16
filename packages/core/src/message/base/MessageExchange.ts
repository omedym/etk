import type { IMessage } from './Message';
import type { IMessageQueueDefinition } from './MessageQueue';
import { AbstractMessageQueue } from './MessageQueue';

/**
 * IMessageExchangeDefinition
 *
 * The base interface for defining a queue backed exchange and its message bindings
 * which are used to determine what it can accept inbound and any special
 * handling for outbound.
 */
export interface IMessageExchangeDefinition extends IMessageQueueDefinition { }

export interface IMessageExchange<T extends IMessageExchangeDefinition = IMessageExchangeDefinition> {
  readonly definition: T;

  publishOrSend: <T extends IMessage>(message: T) => Promise<void>;
}

export abstract class AbstractMessageExchange<T extends IMessageExchangeDefinition = IMessageExchangeDefinition>
  extends AbstractMessageQueue<T>
  implements IMessageExchange<T>
{
  async publishOrSend<T extends IMessage>(message: T): Promise<void> {
   return super.add(message);
  }
}
