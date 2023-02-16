import { IMessage } from '../../message/base/Message';
import { IGatewayDefinition } from './GatewayDefinition';

export interface IGateway<T extends IGatewayDefinition = IGatewayDefinition> {
  readonly definition: T;

  isAllowed: <T extends IMessage>(message: T) => boolean;
  publishOrSend: <T extends IMessage>(message: T) => void;
}
