import type { IEvent, IEventDefinition } from '../message/Event';
import type { IGatewayDefinition } from './base';
import { AbstractGateway } from './base';

export interface IEventGatewayDefinition extends IGatewayDefinition {
  gatewayType: 'event';
  allows: IEventDefinition[];
}

export abstract class AbstractEventGateway<
  TDefinition extends IEventGatewayDefinition = IEventGatewayDefinition
  > extends AbstractGateway<TDefinition> {

  publish<T extends IEvent>(
    event: T,
  ) {
    this.publishOrSend(event)
  }
}
