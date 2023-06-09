import { ICommand, ICommandDefinition } from './Command';
import { IEvent, IEventDefinition } from './Event';
import { IQuery, IQueryDefinition } from './Query';
import { ITask, ITaskDefinition } from './Task';

export * from './base';

export * from './Command';
export * from './CommandGateway';
export * from './Event';
export * from './EventGateway';
export * from './Query';
export * from './Request';
export * from './Task';
export * from './TaskGateway';

export type Message =
  | ICommand
  | IEvent
  | IQuery
  | ITask
;

export type MessageDefinition =
  | ICommandDefinition
  | IEventDefinition
  | IQueryDefinition
  | ITaskDefinition
;
