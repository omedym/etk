import { IMessageGatewayDefinition, AbstractMessageExchange } from './base';
import { IEvent } from './Event';

export interface IEventGatewayDefinition extends IMessageGatewayDefinition {
  gatewayType: 'event';
}

export interface IEventGateway<
  TDefinition extends IEventGatewayDefinition = IEventGatewayDefinition,
  T extends IEvent = any,
> {
  readonly definition: TDefinition;
  publish: (event: T) => Promise<void>;
}

export abstract class AbstractEventGateway<
  TDefinition extends IEventGatewayDefinition = IEventGatewayDefinition,
  T extends IEvent = any
>
  extends AbstractMessageExchange<TDefinition>
  implements IEventGateway<TDefinition, T>
{
    async publish(event: T): Promise<void> {
      return this.publishOrSend(event);
  }
}
