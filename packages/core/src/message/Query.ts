import type { IRequest, IRequestData, IRequestDefinition, IRequestMetadata } from './Request';
import type { IUnknownMessageData } from './base/MessageData';

export interface IQueryDefinition extends IRequestDefinition {
  messageType: 'query';
}

export interface IQueryData extends IRequestData {}

export interface IQueryMetadata extends IRequestMetadata {}

/**
 * ICommand
 *
 * The interface for Command messages.
 */
export interface IQuery<
  TData extends IQueryData = IUnknownMessageData,
  TMetadata extends IQueryMetadata = IQueryMetadata,
>
  extends IRequest<TData, TMetadata> { }
