import type { IMessage } from './Message';
import type { IMessageQueueDefinition } from './MessageQueue';
import { AbstractMessageQueue } from './MessageQueue';

/**
 * IMessageConsumerDefinition
 *
 * The base interface for defining a queue backed consumer of messages and
 * the message bindings to determine what it can accept.
 */
export interface IMessageConsumerDefinition extends IMessageQueueDefinition { }

export interface IMessageConsumer<T extends IMessageConsumerDefinition = IMessageConsumerDefinition> {
  readonly definition: T;

  send: <T extends IMessage>(message: T) => Promise<void>;
}

export abstract class AbstractMessageConsumer<T extends IMessageConsumerDefinition = IMessageConsumerDefinition>
  extends AbstractMessageQueue<T>
  implements IMessageConsumer<T>
{
  async send<T extends IMessage>(message: T): Promise<void> {
    return super.add(message);
  }
}
