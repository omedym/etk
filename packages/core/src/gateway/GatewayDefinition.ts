import { IExchangeDefinition } from '../message/base/ExchangeDefinition';

/**
 * IGatewayDefinition
 *
 * The base interface for defining gateways and the types of messages they allow.
 */
export interface IGatewayDefinition extends IExchangeDefinition {
  gatewayType: 'command' | 'event' | 'query' | 'message';
}
