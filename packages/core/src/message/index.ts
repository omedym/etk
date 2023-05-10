import { ICommand, ICommandDefinition } from './Command';
import { IEvent, IEventDefinition } from './Event';
import { IQuery, IQueryDefinition } from './Query';

export * from './Command';
export * from './Event';
export * from './Query';
export * from './Request';
export * from './base';

export type Message =
  | ICommand
  | IEvent
  | IQuery
;

export type MessageDefinition =
  | ICommandDefinition
  | IEventDefinition
  | IQueryDefinition
;
