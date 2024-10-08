import { NestWorkerOptions } from '@nestjs/bullmq/dist/interfaces/worker-options.interface';
import { createId } from '@paralleldrive/cuid2';
import { JobsOptions, Queue } from 'bullmq';

import { ILogger } from '@omedym/nestjs-telemetry';

import type { IMessage, IUnknownMessage } from './Message';
import type { MessageBinding } from './MessageBinding';


export interface IMessageQueueDefinition {
  queueId: string;
  queueGroupId?: string;
  description?: string;
  bindings: MessageBinding[];
  jobsOptions?: JobsOptions;
  workerOptions?: NestWorkerOptions;
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
  protected readonly queue: Queue;
  protected readonly logger: ILogger;

  protected _defaultJobsOptions: JobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  }
  constructor(
    queue: Queue,
    logger: ILogger,
    jobsOptions?: JobsOptions,
  ) {
    this.queue = queue;
    this.logger = logger;

    if (this?.definition?.jobsOptions) this._defaultJobsOptions = this.definition.jobsOptions;
    if (jobsOptions) this._defaultJobsOptions = jobsOptions;
  }

  isAllowed(message: T): boolean {
    const bindings = this.definition.bindings?.filter(b => b.dir == 'in');
    const allowed = bindings.find(b => b.msg.cloudEvent.type === message.type);

    if (bindings.length === 0 || allowed) return true;
    return false;
  }

  protected async add(message: T, options?: JobsOptions, name?: string) {
    this.logger.debug(`Params`, { message, options, name });

    if (this.isAllowed(message) === false) {
      const logMsg = `${this.constructor.name} does not allow: ${message.type}`;
      this.logger.warn(logMsg, { message, options, name });
      throw Error(logMsg);
    }

    let jobId = createId();
    // > Bull is smart enough not to add the same repeatable job if the repeat options are the same.
    // > ..If you have two repeatable jobs with the same name and options,
    // > you could use distinct jobIds to differentiate them..
    // We should keep repeatable jobs similar, remove all generated options
    // Repeatable jobId is a hash of task.data (Generated in TaskGateway class)
    if (options?.repeat && options?.jobId) {
      delete message.time;
      delete message.idempotencykey;
      jobId = options.jobId;
    }
    const jobOptions = { ...options, jobId };
    const jobName = name ?? message?.type ?? 'com.unknown';

    this.logger.info(`Enqueuing ${jobName} message: ${message.id}`, { jobId, jobOptions, jobName, message });
    return await this.queue.add(jobName, message, jobOptions);
  }
}
