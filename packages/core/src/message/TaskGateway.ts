import { Job } from 'bullmq';

import { IMessageGatewayDefinition, AbstractMessageExchange } from './base';
import { ITask } from './Task';

export interface ITaskGatewayDefinition extends IMessageGatewayDefinition {
  gatewayType: 'task';
}

export interface ITaskGateway<
  TDefinition extends ITaskGatewayDefinition = ITaskGatewayDefinition,
  T extends ITask = any,
> {
  readonly definition: TDefinition;
  send(task: T): Promise<Job<T>>;
}

export abstract class AbstractTaskGateway<
  TDefinition extends ITaskGatewayDefinition = ITaskGatewayDefinition,
  T extends ITask = any,
>
  extends AbstractMessageExchange<TDefinition>
  implements ITaskGateway<TDefinition, T>
{
  async send(task: T): Promise<Job<T>> {
    throw new Error(`Method not implemented`);
  }
}
