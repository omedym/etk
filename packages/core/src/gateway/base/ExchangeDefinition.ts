import type { MessageBinding } from '../../message/base/MessageBinding';

/**
 * IExchangeDefinition
 *
 * The base interface for defining exchanges and their message bindings.
 */
export interface IExchangeDefinition {
  bindings?: MessageBinding[];
}
