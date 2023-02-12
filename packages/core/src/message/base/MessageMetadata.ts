
/**
 * Message Origin Metadata
 *
 * In messaging systems it is common to group messages together or correlate them. A Command message might result
 * in one or several Event messages and a Query message might result in one or several QueryResponse messages.
 *
 * The correlationId of a message should always references the identifier of the message it originates from (i.e. the parent message).
 * The traceId on the other hand references to the message identifier which started the chain of messages (i.e. the root message).
 *
 * When neither of these fields are present in the parent message when a new message is created, the message identifier should be used for both.
 *
 * To place this in an example, if you would handle a Command message which in turn publishes an Event message, the Event message's
 * MetaData will be populated based on:
 *   - The Command message's identifier for the correlationId.
 *   - The Command message's presence of the traceId in the MetaData or otherwise the message's identifier for the traceId.
 *
 * Entirely derived from Axon Framework's MessageOriginProvider.
 * [Learn More](https://docs.axoniq.io/reference-guide/axon-framework/messaging-concepts/message-correlation)
 *
 */
export interface IMessageOriginMetadata {
  /** The correlationId of a message always references the identifier of the message it originates from (i.e. the parent message). */
  corelationId?: string;
  /** The traceId on the other hand references to the message identifier which started the chain of messages (i.e. the root message). */
  traceId?: string;
}

export interface IMessageMetadata extends IMessageOriginMetadata { }

export const DefaultMessageMetadata: IMessageMetadata = {
};
