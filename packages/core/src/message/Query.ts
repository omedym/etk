import { IUnknownMessageData } from "./base";
import { IRequestDefinition, IRequestData, IRequestMetadata, IRequest } from "./Request";

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
