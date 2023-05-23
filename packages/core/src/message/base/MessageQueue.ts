import type { JobsOptions, Queue } from 'bullmq';
import { createId } from '@paralleldrive/cuid2';

import type { IMessage, IUnknownMessage } from './Message';
import type { MessageBinding } from './MessageBinding';

export interface IMessageQueueDefinition {
  queueId: string;
  queueGroupId?: string;
  description?: string;
  bindings: MessageBinding[];
  jobsOptions?: JobsOptions;
}

export interface IMessageQueue<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition,
  T extends IMessage | IUnknownMessage = IMessage,
> {
  readonly definition: TDefinition;

  isAllowed: (message: T) => boolean;
}

export abstract class AbstractMessageQueue<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition,
  T extends IMessage | IUnknownMessage = IMessage,
>
  implements IMessageQueue<TDefinition, T>
{
  readonly definition: TDefinition;

  protected _defaultJobsOptions: JobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  }
  protected _queue: Queue;

  constructor(
    queue: Queue,
    jobsOptions?: JobsOptions,
  ) {
    this._queue = queue;
    if (this.definition?.jobsOptions) this._defaultJobsOptions = this.definition.jobsOptions;
    if (jobsOptions) this._defaultJobsOptions = jobsOptions;
  }

  isAllowed(message: T): boolean {
    const bindings = this.definition.bindings?.filter(b => b.dir == 'in');
    const allowed = bindings.find(b => b.msg.cloudEvent.type === message.type);

    if (bindings.length === 0 || allowed) return true;
    return false;
  }

  protected async add(message: T) {
    if (this.isAllowed(message) === false)
      throw Error(`${this.constructor.name} does not allow: ${message.type}`);

    const jobId = createId();
    const type = message?.type ? message.type : 'com.unknown';

    return this._queue.add(type, message, { jobId });
  }
}
