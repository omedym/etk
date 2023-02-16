import { IGatewayDefinition } from '../base';
import { IQueueDefinition } from './QueueDefinition';

/**
 * IQueuedGatewayDefinition
 *
 * The base interface for defining queued gateways.
 */
export interface IQueuedGatewayDefinition extends IGatewayDefinition {
  queue: IQueueDefinition;
}
