import { IMessageExchangeDefinition } from '../message/base/MessageExchange';

/**
 * IGatewayDefinition
 *
 * The base interface for defining gateways and the types of messages they allow.
 */
export interface IGatewayDefinition extends IMessageExchangeDefinition {
  gatewayType: 'command' | 'event' | 'query' | 'message';
}
