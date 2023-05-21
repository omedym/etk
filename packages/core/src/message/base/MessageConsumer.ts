import { Message } from '..';
import type { IMessage, IUnknownMessage } from './Message';
import type { IMessageQueueDefinition } from './MessageQueue';
import { AbstractMessageQueue } from './MessageQueue';

/**
 * IMessageConsumerDefinition
 *
 * The base interface for defining a queue backed consumer of messages and
 * the message bindings to determine what it can accept.
 */
export interface IMessageConsumerDefinition extends IMessageQueueDefinition { }

export interface IMessageConsumer<
  TDefinition extends IMessageConsumerDefinition = IMessageConsumerDefinition,
  T extends IMessage = any,
> {
  readonly definition: TDefinition;
  send: (message: T) => Promise<void>;
}

export abstract class AbstractMessageConsumer<
  TDefinition extends IMessageConsumerDefinition = IMessageConsumerDefinition,
  T extends Message = any
>
  extends AbstractMessageQueue<TDefinition>
  implements IMessageConsumer<TDefinition, T>
{
  async send(message: T): Promise<void> {
    const job = await this.add(message);
  }
}
