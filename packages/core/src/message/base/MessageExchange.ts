import type { Job, JobsOptions } from 'bullmq';

import { ICommand } from '../Command';
import { IEvent } from '../Event';
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

export interface IMessageExchange<
  TDefinition extends IMessageExchangeDefinition = IMessageExchangeDefinition
> {
  readonly definition: TDefinition;
}

export abstract class AbstractMessageExchange<
  TDefinition extends IMessageExchangeDefinition = IMessageExchangeDefinition,
  T extends ICommand | IEvent = any
>
  extends AbstractMessageQueue<TDefinition>
  implements IMessageExchange<TDefinition>
{
  protected async publishOrSend(message: T, options?: JobsOptions): Promise<Job<T>> {
    return await this.add(message, options);
  }
}
