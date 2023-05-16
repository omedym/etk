import type { Queue } from 'bullmq';

import type { IMessage } from './Message';
import type { IMessageExchangeDefinition } from './MessageExchange.definition';
import { MessageDefinition } from '..';

export interface IMessageExchange<T extends IMessageExchangeDefinition = IMessageExchangeDefinition> {
  readonly definition: T;

  isAllowed: <T extends IMessage>(message: T) => boolean;
  publishOrSend: <T extends IMessage>(message: T) => void;
}

export abstract class AbstractMessageExchange<T extends IMessageExchangeDefinition = IMessageExchangeDefinition>
  implements IMessageExchange<T>
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

  publishOrSend<T extends IMessage>(
    message: T
  ): void {
    if (this.isAllowed(message) == false)
      throw Error(`${this.constructor.name} does not allow: ${message.type}`);

    throw new Error('NOT IMPLEMENTED');
  }
}
