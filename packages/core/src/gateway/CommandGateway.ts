import { ICommand, ICommandDefinition } from '../message/Command';
import { AbstractQueuedGateway, IQueuedGatewayDefinition } from './queued';

export interface ICommandGatewayDefinition extends IQueuedGatewayDefinition {
  gatewayType: 'command';
}

export interface ICommandGateway {
  readonly definition: ICommandGatewayDefinition;
  send: <T extends ICommand>(command: T) => Promise<void>
}

export abstract class AbstractCommandGateway<T extends ICommandGatewayDefinition = ICommandGatewayDefinition>
  extends AbstractQueuedGateway<T>
  implements ICommandGateway
{
  async send<T extends ICommand>(
    command: T,
  ) {
    super.publishOrSend(command);
  }
}
