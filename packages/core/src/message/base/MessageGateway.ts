import { IMessageExchangeDefinition } from './MessageExchange';

/**
 * IMessageGatewayDefinition
 *
 * The base interface for defining gateways and the types of messages they allow.
 */
export interface IMessageGatewayDefinition extends IMessageExchangeDefinition {
  gatewayType: 'command' | 'event' | 'query' | 'task' | 'message';
}
