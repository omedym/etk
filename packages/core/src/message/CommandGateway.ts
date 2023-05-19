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
  send: (command: T) => Promise<void>
}

export abstract class AbstractCommandGateway<
  TDefinition extends ICommandGatewayDefinition = ICommandGatewayDefinition,
  T extends ICommand = any,
>
  extends AbstractMessageExchange<TDefinition>
  implements ICommandGateway<TDefinition, T>
{
  async send(command: T): Promise<void> {
    return this.publishOrSend(command);
  }
}
