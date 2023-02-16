import type { Queue } from 'bullmq';

import type { IGateway } from '../base';
import type { IMessage } from '../../message/base';
import type { IQueuedGatewayDefinition } from './QueuedGatewayDefinition';

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
    const allowed = this.definition.allows
      .find(m => m.cloudEvent.type == message.type);

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
