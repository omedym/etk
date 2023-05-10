import { IExchangeDefinition } from './ExchangeDefinition';
import { IMessageDefinition } from '../../message/base/MessageDefinition';

/**
 * IGatewayDefinition
 *
 * The base interface for defining gateways and the types of messages they allow.
 */
export interface IGatewayDefinition extends IExchangeDefinition {
  gatewayType: 'command' | 'event' | 'query' | 'message';
}
