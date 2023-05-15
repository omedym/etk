import type { Queue } from 'bullmq';

import type { IMessage } from './Message';
import type { IExchangeDefinition } from './ExchangeDefinition';
import { MessageDefinition } from '..';

export interface IExchange<T extends IExchangeDefinition = IExchangeDefinition> {
  readonly definition: T;

  isAllowed: <T extends IMessage>(message: T) => boolean;
  publishOrSend: <T extends IMessage>(message: T) => void;
}

export abstract class AbstractExchange<T extends IExchangeDefinition = IExchangeDefinition>
  implements IExchange<T>
{
  readonly definition: T;
  protected queue: Queue;

  isAllowed<T extends IMessage>(
    message: T,
  ): boolean {
    const bindings = this.definition.bindings?.filter(b => b.dir == 'in');

    if (!bindings || bindings.length == 0)
      return true;

    // TODO: Switch to message type name string binding (only)
    const allowed = bindings.find(b => typeof b.msg !== 'string'
      ? (b.msg as unknown as MessageDefinition).cloudEvent.type == message.type
      : b.msg == message.type
    );

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
