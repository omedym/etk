/** Abstract Modelling WIP */
import { Job } from 'bullmq';
import { isMatching, P } from 'ts-pattern';
import { Message } from './message';
import { TrackedQueueProcessor } from './queue/TrackedQueueProcessor';
import { IGatewayDefinition } from './gateway';


enum Messages {
  CreateOrderCommand = 'com.dundermifflin.order.CreateOrderCommand',
  ExpediteOrderCommand = 'com.dundermifflin.order.ExpediteOrderCommand',
  OrderCreatedEvent = 'com.dundermifflin.order.OrderCreatedEvent',
  OrderDeliveredEvent = 'com.dundermifflin.order.OrderCancelledEvent',
  OrderExpeditedEvent = 'com.dundermifflin.order.OrderExpeditedEvent',
}

const Handlers = {
  OrderCommandHandler: 'OrderCommandHandler',
  OrderEventHandler: 'OrderEventHandler',
  AuditableEventsHandler: 'AuditableEventsHandler',
}


const CommandGatewayDefinition: IGatewayDefinition = {
  gatewayType: 'command',
  bindings: [
    { dir: 'in', msg: Messages.CreateOrderCommand },
    { dir: 'out', msg: Messages.CreateOrderCommand, toQueue: Handlers.OrderCommandHandler },
  ],
  queue: { name: 'gateway-command' }
}

const EventGatewayDefinition: IGatewayDefinition = {
  gatewayType: 'event',
  bindings: [
    { dir: 'in',  msg: Messages.OrderCreatedEvent },
    { dir: 'in',  msg: Messages.OrderDeliveredEvent },
    { dir: 'out', msg: Messages.OrderCreatedEvent,   toQueues: [ Handlers.OrderEventHandler, Handlers.AuditableEventsHandler ]},
    { dir: 'out', msg: Messages.OrderDeliveredEvent, toQueues: [ Handlers.OrderEventHandler ]},
    { dir: 'out', msg: Messages.OrderExpeditedEvent, toQueues: [ Handlers.AuditableEventsHandler ], pattern: (e: Message) => isMatching(P.string, e) }
  ],
  queue: { name: 'gateway-event' }
}


abstract class AbstractOrderCommandHandler {
  abstract onCreateOrderCommand(command: Messages.CreateOrderCommand): void
}

class OrderCommandHandler extends AbstractOrderCommandHandler {
  onCreateOrderCommand(command: Messages.CreateOrderCommand) { throw new Error('Method not implemented.') }
}


abstract class AbstractOrderEventHandler
  extends TrackedQueueProcessor
{
  abstract onOrderCreatedEvent(event: Messages.OrderCreatedEvent): void
  abstract onOrderDeliveredEvent(event: Messages.OrderDeliveredEvent): void

  async process(job: Job<Messages.OrderCreatedEvent | Messages.OrderDeliveredEvent> ) {
    switch(job.name) {
      case Messages.OrderCreatedEvent:
        return this.onOrderCreatedEvent(job.data as Messages.OrderCreatedEvent);
      case Messages.OrderDeliveredEvent:
        return this.onOrderDeliveredEvent(job.data as Messages.OrderDeliveredEvent);
      default:
        throw new Error(`Unknown Message: ${job.name}`);
      }
  }
}

class OrderEventHandler extends AbstractOrderEventHandler {
  onOrderCreatedEvent(event: Messages.OrderCreatedEvent) { throw new Error('Method not implemented.') }
  onOrderDeliveredEvent(event: Messages.OrderDeliveredEvent) { throw new Error('Method not implemented.') }
}

abstract class AbstractAuditableEventsHandler {
  abstract onOrderCreatedEvent(event: Messages.OrderCreatedEvent): void
}

class AuditHandler extends AbstractAuditableEventsHandler {
  onOrderCreatedEvent(event: Messages.OrderCreatedEvent) { throw new Error('Method not implemented.') }

}
