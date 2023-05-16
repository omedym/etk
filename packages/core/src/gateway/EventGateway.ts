import { AbstractMessageExchange } from '../message/base/MessageExchange';
import { IEvent } from '../message/Event';
import { IGatewayDefinition } from './GatewayDefinition';

export interface IEventGatewayDefinition extends IGatewayDefinition {
  gatewayType: 'event';
}

export interface IEventGateway {
  readonly definition: IEventGatewayDefinition;
  publish: <T extends IEvent>(event: T) => Promise<void>;
}

export abstract class AbstractEventGateway<TDefinition extends IEventGatewayDefinition = IEventGatewayDefinition>
  extends AbstractMessageExchange<TDefinition>
  implements IEventGateway
{
  async publish<T extends IEvent>(event: T): Promise<void> {
    return this.publishOrSend(event);
  }
}
