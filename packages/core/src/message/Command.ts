import { IUnknownMessageData } from "./base";
import { IRequestDefinition, IRequestData, IRequestMetadata, IRequest } from "./Request";

export interface ICommandDefinition extends IRequestDefinition {
  messageType: 'command';
}

export interface ICommandData extends IRequestData {}

export interface ICommandMetadata extends IRequestMetadata {}

/**
 * ICommand
 *
 * The interface for Command messages.
 */
export interface ICommand<
  TData extends ICommandData = IUnknownMessageData,
  TMetadata extends ICommandMetadata = ICommandMetadata,
>
  extends IRequest<TData, TMetadata> { }
