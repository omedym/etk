import type { IEvent, IEventDefinition } from '../message/Event';
import { AbstractQueuedGateway, IQueuedGatewayDefinition } from '../gateway/queued';

export interface IEventGatewayDefinition extends IQueuedGatewayDefinition {
  gatewayType: 'event';
  allows: IEventDefinition[];
}

export interface IEventGateway {
  readonly definition: IEventGatewayDefinition;
  publish: <T extends IEvent>(event: T) => Promise<void>;
}

export abstract class AbstractEventGateway<T extends IEventGatewayDefinition = IEventGatewayDefinition>
  extends AbstractQueuedGateway<T>
  implements IEventGateway
{
  async publish<T extends IEvent>(
    event: T,
  ) {
    this.publishOrSend(event)
  }
}
