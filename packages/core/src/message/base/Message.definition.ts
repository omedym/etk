/**
 * IMessageDefinition
 *
 * The base interface for defining messages and their type oriented metadata
 * such as their source and version.
 */
export interface IMessageDefinition {
  messageType: 'command' | 'event' | 'query';
  cloudEvent: {
    dataContentType: 'application/json';
    type: string;
    specVersion: '1.0';
  },
}
