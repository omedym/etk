import type { Queue } from 'bullmq';

import type { IMessage } from './Message';
import type { MessageBinding } from './MessageBinding';

export interface IMessageQueueDefinition {
  queueId: string;
  queueGroupId?: string;
  description?: string;
  bindings: MessageBinding[];
}

export interface IMessageQueue<T extends IMessageQueueDefinition = IMessageQueueDefinition> {
  readonly definition: T;

  isAllowed: <T extends IMessage>(message: T) => boolean;
  // add: <T extends IMessage>(message: T) => void;
}

export abstract class AbstractMessageQueue<T extends IMessageQueueDefinition = IMessageQueueDefinition>
  implements IMessageQueue<T>
{
  readonly definition: T;
  protected queue: Queue;

  isAllowed<T extends IMessage>(
    message: T,
  ): boolean {
    const bindings = this.definition.bindings?.filter(b => b.dir == 'in');
    const allowed = bindings.find(b => b.msg.cloudEvent.type === message.type);

    if (allowed) return true;
    return false;
  }

  async add<T extends IMessage>(message: T): Promise<void> {
    if (this.isAllowed(message) == false)
      throw Error(`${this.constructor.name} does not allow: ${message.type}`);

    throw new Error('NOT IMPLEMENTED');
  }
}
