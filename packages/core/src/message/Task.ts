import { IUnknownMessageData } from './base';
import { IRequestDefinition, IRequestData, IRequestMetadata, IRequest } from './Request';


export interface ITaskDefinition extends IRequestDefinition {
  messageType: 'task';
}

export interface ITaskData extends IRequestData {}

export interface ITaskMetadata extends IRequestMetadata {
  task: {
    name: string;
  },
}

/**
 * ITask
 *
 * The interface for Task messages.
 */
export interface ITask<
  TData extends ITaskData = IUnknownMessageData,
  TMetadata extends ITaskMetadata = ITaskMetadata,
>
  extends IRequest<TData, TMetadata> { }
