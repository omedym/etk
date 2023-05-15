import { AbstractExchange } from '../message/base/Exchange';
import { ICommand } from '../message/Command';
import { IGatewayDefinition } from './GatewayDefinition';

export interface ICommandGatewayDefinition extends IGatewayDefinition {
  gatewayType: 'command';
}

export interface ICommandGateway {
  readonly definition: ICommandGatewayDefinition;
  send: <T extends ICommand>(command: T) => Promise<void>
}

export abstract class AbstractCommandGateway<T extends ICommandGatewayDefinition = ICommandGatewayDefinition>
  extends AbstractExchange<T>
  implements ICommandGateway
{
  async send<T extends ICommand>(
    command: T,
  ) {
    super.publishOrSend(command);
  }
}
