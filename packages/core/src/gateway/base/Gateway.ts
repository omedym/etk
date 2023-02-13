import { IMessage } from "../../message/base/Message";
import { IGatewayDefinition } from "./GatewayDefinition";

export abstract class AbstractGateway<
  TDefinition extends IGatewayDefinition = IGatewayDefinition
> {
  abstract definition: TDefinition;

  isAllowed<T extends IMessage>(
    message: T,
  ): boolean {
    const allowed = this.definition.allows
      .find(m => m.cloudEvent.type == message.type);

    if (allowed) return true;

    return false;
  }

  publishOrSend<T extends IMessage>(
    message: T
  ): void {
    if (this.isAllowed(message) == false)
      throw Error(`${this.constructor.name} does not allow: ${message.type}`);

    throw new Error('NOT IMPLEMENTED');
  }
}
