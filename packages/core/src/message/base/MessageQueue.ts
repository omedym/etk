import type { JobsOptions, Queue } from 'bullmq';

import type { IMessage, IUnknownMessage } from './Message';
import type { MessageBinding } from './MessageBinding';

export interface IMessageQueueDefinition {
  queueId: string;
  queueGroupId?: string;
  description?: string;
  bindings: MessageBinding[];
}

export interface IMessageQueue<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition,
  T extends IMessage | IUnknownMessage = IMessage,
> {
  readonly definition: TDefinition;

  isAllowed: (message: T) => boolean;
}

export abstract class AbstractMessageQueue<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition,
  T extends IMessage | IUnknownMessage = IMessage,
>
  implements IMessageQueue<TDefinition, T>
{
  readonly definition: TDefinition;
  protected _queue: Queue;
  protected _defaultJobsOptions: JobsOptions = {
    attempts: 5,
    backoff: { type: 'exponential', delay: 500 },
    removeOnComplete: true,
  }

  isAllowed(message: T): boolean {
    const bindings = this.definition.bindings?.filter(b => b.dir == 'in');
    const allowed = bindings.find(b => b.msg.cloudEvent.type === message.type);

    if (bindings.length === 0 || allowed) return true;
    return false;
  }

  protected async add(message: T): Promise<void> {
    if (this.isAllowed(message) == false)
      throw Error(`${this.constructor.name} does not allow: ${message.type}`);

    throw new Error('NOT IMPLEMENTED');
  }
}
