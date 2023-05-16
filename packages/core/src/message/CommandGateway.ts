import { IMessageGatewayDefinition, AbstractMessageExchange } from "./base";
import { ICommand } from "./Command";

export interface ICommandGatewayDefinition extends IMessageGatewayDefinition {
  gatewayType: 'command';
}

export interface ICommandGateway {
  readonly definition: ICommandGatewayDefinition;
  send: <T extends ICommand>(command: T) => Promise<void>
}

export abstract class AbstractCommandGateway<T extends ICommandGatewayDefinition = ICommandGatewayDefinition>
  extends AbstractMessageExchange<T>
  implements ICommandGateway
{
  async send<T extends ICommand>(command: T): Promise<void> {
    return super.publishOrSend(command);
  }
}
