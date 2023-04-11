import { WorkerHost } from '@nestjs/bullmq';
import { Worker } from 'bullmq';

/**
 * Wraps the NestJs WorkerHost abstract class in a way that allows us to define a
 * generic type for the Job DataType and ResultType.
 *
 * @
 */
export abstract class TrackedWorkerHost<
  DataType extends any = any,
  ResultType extends any = any,
> extends WorkerHost<Worker<DataType, ResultType, string>> {}
