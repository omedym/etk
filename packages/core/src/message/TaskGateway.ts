import { TimeZone, getTimeZones } from '@vvo/tzdb';
import { Job, JobsOptions, RepeatOptions } from 'bullmq';
import { isValidCron } from 'cron-validator';
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
  /** Frequency Task reoccurs expressed as an ISO Duration */
  frequency?: Duration | string;
  /** Pattern Task reoccurs expressed as a Unix Cron expression */
  pattern?: string;
  /** Task Name/Key */
  name?: string;
  /** An optional IANA Timezone Database Name to use as a preset for the Unix Cron expression  */
  timeZone?: string;
  /** An optional point in time to start the pattern recurring at */
  startAt?: DateTime | string;
  /** An optional point in time to end the pattern recurring at */
  endAt?: DateTime | string;
}

type FixedRepeatOptions = {}

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
    opts: ScheduleEveryOptions,
  ): Promise<Job<T>> {
    this.logger.debug(`Params`, { task, options: opts });

    // Check for valid configuration options
    const checkOptions = this.checkScheduleEveryOptions(opts);
    if (checkOptions.isValid === false) {
      const reasons = checkOptions.error;
      const logMsg = `Cannot schedule task; ${reasons[reasons.length -1]}`;
      this.logger.error(logMsg, { task, options: opts, checkOptions });
      throw new Error(logMsg, { cause: { checkOptions } });
    }

    const frequency = typeof opts.frequency === 'string'
      ? Duration.fromISO(opts.frequency)
      : opts.frequency;
    const frequencyIso = frequency?.toISO();
    const frequencyMs = frequency?.toMillis();
    const frequencyHuman = frequency?.toHuman();

    const tz = opts.timeZone && this.isValidTz(opts.timeZone).timeZone;
    const tzAbbreviation = tz ? tz.abbreviation : 'Etc/UTC';
    const startAt = typeof opts.startAt === 'string'
      ? DateTime.fromISO(opts.startAt)
      : opts.startAt;
    const endAt = typeof opts.endAt === 'string'
      ? DateTime.fromISO(opts.endAt)
      : opts.endAt;

    // Form a jobId for the repeatable job based on a hash of the message data
    // so we can find previous instances based on configuration as we only allow
    // a single repeatable job per.
    const jobId = crypto.createHash('md5').update(stableStringify(task.data)).digest('hex');

    // Form a jobName that can also be used to locate recurring tasks
    const jobNameBase = opts.name ?? task.type;
    const jobNameQualifier = opts.pattern
      ? opts.pattern.replace(' ', '-') + '-' + tzAbbreviation
      : frequencyIso;
    const jobName = `${jobNameBase}}_${jobNameQualifier}`;

    // Configure the BullMQ job options
    const jobRepeatOptions: RepeatOptions = frequency
      ? { every: frequencyMs }
      : {
        pattern: opts.pattern,
        ...(tz ? { tz: opts.timeZone } : { utc: true }),
        ...(startAt ? { startDate: startAt.toISO() } : {}),
        ...(endAt ? { endDate: endAt.toISO() } : {}),
      };
    const jobOptions: JobsOptions = { jobId: jobId, repeat: jobRepeatOptions };

    // Create a good logging breadcrumb
    const otherOptions = opts.startAt || opts.endAt || opts.timeZone;
    const scheduleMsg = frequency
      ? `Scheduling ${jobName} to reoccur every ${frequencyHuman} (\`${frequencyIso}\` = ${frequencyMs}ms)`
      : `Scheduling ${jobName} to reoccur per pattern \`${opts.pattern}\`${otherOptions && ' with extra options'}`;
    this.logger.info(scheduleMsg, { jobId, task, jobName, jobOptions, options: opts });

    // Remove existing versions that match either the configuration (based on a hash of the
    // message data or its name.
    await this.removeExistingRepeatableJobs({ id: jobId, name: jobName });

    // Add the new repeatable job to the queue
    return this.add(task, jobOptions, jobName);
  }

  /** Check if the provided Time Zone matches a valid IANA Time Zone Database name */
  protected isValidTz = (tz: string): { isValid: boolean, timeZone?: TimeZone } => {
    if(!tz) return { isValid: false };
    const timeZones = getTimeZones({ includeUtc: true });
    const result = timeZones.find((timeZone: TimeZone) => timeZone.name === tz || timeZone.group.includes(tz));
    return { isValid: !!result, timeZone: result };
  }

  /** Check if the provided ScheduleEveryOptions configuration is valid */
  protected checkScheduleEveryOptions(opts: ScheduleEveryOptions): { isValid: boolean, error: string[] } {
    let error: string[] = [];

    try {
      const isValidTimeZone = !!opts.timeZone && this.isValidTz(opts.timeZone);
      const isValidPattern = !!opts.pattern && isValidCron(opts.pattern, { seconds: true, allowSevenAsSunday: true});

      const isValidFrequency = opts.frequency && typeof opts.frequency === 'string'
        ? Duration.fromISO(opts.frequency).isValid
        : (opts.frequency as Duration).isValid;

      const isValidStartAt = opts.startAt && typeof opts.startAt === 'string'
        ? DateTime.fromISO(opts.startAt).isValid
        : (opts.startAt as DateTime).isValid;
      const isValidEndAt = opts.endAt && typeof opts.endAt === 'string'
        ? DateTime.fromISO(opts.endAt).isValid
        : (opts.endAt as DateTime).isValid;

      if(!opts.frequency && !opts.pattern)
        error.push(`Missing frequency or pattern`);

      if(opts.frequency && opts.pattern)
        error.push(`Both frequency and pattern specified`);

      if(opts.frequency && !isValidFrequency)
        error.push(`Invalid frequency specified`);
      if(opts.pattern && isValidPattern === false)
        error.push(`Invalid cron expression specified`);

      if(opts.timeZone && isValidTimeZone === false)
        error.push(`Invalid time zone specified`);
      if(opts.startAt && isValidStartAt === false)
        error.push(`Invalid startAt specified`);
      if(opts.endAt && isValidEndAt === false)
        error.push(`Invalid endAt specified`);

      if(opts.frequency && opts.startAt)
        error.push(`Frequency does not support startAt`);
      if(opts.frequency && opts.endAt)
        error.push(`Frequency does not support endAt`);
      if(opts.frequency && opts.timeZone)
        error.push(`Frequency does not support timeZone`);

    } catch (e) {
      this.logger.error('checkScheduleEveryOptions unknown error', e);
      return { isValid: false, error: ['Unknown error occurred'] };
    }

    return { isValid: error.length === 0, error };
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
        this.logger.debug(`Reviewing repeatable jobId: ${job.id} jobName:${job.name}`);

        if (!job.id.includes(id) && !(job.name === name))
          return;

        this.logger.info(`Removing prior repeatable job definition ${job.name}`);
        await this.queue.removeRepeatableByKey(job.key);
      })
    });
  }
}
