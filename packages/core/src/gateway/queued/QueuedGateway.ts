import type { Queue } from 'bullmq';

import type { IGateway } from '../base';
import type { IAllowedMessageBinding, IMessage } from '../../message/base';
import type { IQueuedGatewayDefinition } from './QueuedGatewayDefinition';
import { MessageDefinition } from '../../message';

export interface IQueuedGateway<T extends IQueuedGatewayDefinition>
  extends IGateway<T> {}

export abstract class AbstractQueuedGateway<T extends IQueuedGatewayDefinition = IQueuedGatewayDefinition>
  implements IGateway<T>
{
  readonly definition: T;
  protected queue: Queue;

  isAllowed<T extends IMessage>(
    message: T,
  ): boolean {
    const bindings = this.definition.bindings?.filter(b => b.dir == 'in');

    if (!bindings || bindings.length == 0)
      return true;

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
