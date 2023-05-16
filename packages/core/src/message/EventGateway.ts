import { IMessageGatewayDefinition, AbstractMessageExchange } from "./base";
import { IEvent } from "./Event";

export interface IEventGatewayDefinition extends IMessageGatewayDefinition {
  gatewayType: 'event';
}

export interface IEventGateway {
  readonly definition: IEventGatewayDefinition;
  send: <T extends IEvent>(event: T) => Promise<void>;
  publish: <T extends IEvent>(event: T) => Promise<void>;
}

export abstract class AbstractEventGateway<TDefinition extends IEventGatewayDefinition = IEventGatewayDefinition>
  extends AbstractMessageExchange<TDefinition>
  implements IEventGateway
{
    async send<T extends IEvent>(event: T): Promise<void> {
      return this.publishOrSend(event);
    }

    async publish<T extends IEvent>(event: T): Promise<void> {
      return this.publishOrSend(event);
  }
}
