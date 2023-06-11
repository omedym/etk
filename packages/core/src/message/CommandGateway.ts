import { Job } from 'bullmq';

import { IMessageGatewayDefinition, AbstractMessageExchange } from './base';
import { ICommand } from './Command';

export interface ICommandGatewayDefinition extends IMessageGatewayDefinition {
  gatewayType: 'command';
}

export interface ICommandGateway<
  TDefinition extends ICommandGatewayDefinition = ICommandGatewayDefinition,
  T extends ICommand = any,
> {
  readonly definition: TDefinition;
  send: (command: T) => Promise<Job<T>>
}

export abstract class AbstractCommandGateway<
  TDefinition extends ICommandGatewayDefinition = ICommandGatewayDefinition,
  T extends ICommand = any,
>
  extends AbstractMessageExchange<TDefinition>
  implements ICommandGateway<TDefinition, T>
{
  async send(command: T): Promise<Job<T>> {
    return this.publishOrSend(command);
  }
}
