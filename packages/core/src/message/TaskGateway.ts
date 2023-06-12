import { Job } from 'bullmq';
import crypto from 'crypto';
import { DateTime, Duration } from 'luxon';
import stableStringify from 'safe-stable-stringify';

import { IMessageGatewayDefinition, AbstractMessageExchange } from './base';
import { ITask } from './Task';

export interface ITaskGatewayDefinition extends IMessageGatewayDefinition {
  gatewayType: 'task';
}

export interface ITaskGateway<
  TDefinition extends ITaskGatewayDefinition = ITaskGatewayDefinition,
  T extends ITask = any,
> {
  readonly definition: TDefinition;
  scheduleEvery: (task: T, options: ScheduleEveryOptions) => Promise<Job<T>>;
}

export type ScheduleEveryOptions = {
  /** Frequency Task Reoccurs expressed as an ISO Duration */
  frequency: Duration | string;
  /** Task Name/Key */
  name?: string;
}

export abstract class AbstractTaskGateway<
  TDefinition extends ITaskGatewayDefinition = ITaskGatewayDefinition,
  T extends ITask = any,
>
  extends AbstractMessageExchange<TDefinition>
  implements ITaskGateway<TDefinition, T>
{
  /** Schedule a reoccurring Task */
  async scheduleEvery(
    task: T,
    options: ScheduleEveryOptions,
  ): Promise<Job<T>> {
    this.logger.debug(`Params`, { task, options });

    const frequency = typeof options.frequency === 'string'
      ? Duration.fromISO(options.frequency)
      : options.frequency;

    const frequencyIso = frequency.toISO();
    const frequencyMs = frequency.toMillis();
    const lFrequency = frequency.toHuman();

    // Form a jobId for the repeatable job based on a hash of the message data
    // so we can find previous instances based on configuration as we only allow
    // a single repeatable job per.
    const jobId = crypto.createHash('md5').update(stableStringify(task.data)).digest('hex');
    const jobName = `${options.name ?? task.type}_${frequencyIso}`;
    const jobOptions = { jobId: jobId, repeat: { every: frequencyMs }};
    const scheduleMsg = `Scheduling ${jobName} to reoccur every ${lFrequency} (${frequencyIso} = ${frequencyMs})`;

    // Remove existing versions that match either the configuration (based on a hash of the
    // message data or its name.
    await this.removeExistingRepeatableJobs({ id: jobId, name: jobName });

    // Add the new repeatable job to the queue
    this.logger.info(scheduleMsg, { jobId, task, jobName, jobOptions, options });
    return this.add(task, jobOptions, jobName);
  }

  /**
   * Get all existing repeatable jobs and find any that match the same configuration
   * per the provided jobId (which is typically a hash of the message data) or its
   * name.
   *
   * @param id
   * @param name
   */
  protected async removeExistingRepeatableJobs({ id, name }: { id: string; name: string; }) {
    this.logger.debug(`Checking for existing repeatable job with jobId: ${id} or name: ${name}`);

    this.queue.getRepeatableJobs().then((jobs) => {
      this.logger.debug(`Retrieved ${jobs && jobs.length} repeatable jobs`)

      jobs.forEach(async (job) => {
        this.logger.debug(`Reviewing repeatable jobId: ${job.id} jobName:${job.name}`, job);

        if (!job.id.includes(id) && !(job.name === name))
          return;

        this.logger.info(`Removing prior repeatable job definition ${job.name}`);
        await this.queue.removeRepeatableByKey(job.key);
      })
    });
  }
}
