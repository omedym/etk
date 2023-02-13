import { ICommand, ICommandDefinition } from '../message/Command';
import type { IGatewayDefinition } from './base';
import { AbstractGateway } from './base';

export interface ICommandGatewayDefinition extends IGatewayDefinition {
  gatewayType: 'command';
  allows: ICommandDefinition[];
}

export abstract class AbstractCommandGateway<
  TDefinition extends ICommandGatewayDefinition = ICommandGatewayDefinition
> extends AbstractGateway<TDefinition> {

  send<T extends ICommand>(
    command: T,
  ) {
    this.publishOrSend(command);
  }
}
