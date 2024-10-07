import { OnQueueEvent, QueueEventsHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';

import { ILogger, SentryTransaction } from '@omedym/nestjs-telemetry';

import { TrackedJobEventQueue } from './TrackedJobEventQueue';
import { DefaultClearContext } from './TrackedJobTelemetry';
import { Providers } from '../providers';


@Injectable()
export abstract class TrackedQueueListener extends QueueEventsHost {

  constructor(
    readonly jobEventQueue: TrackedJobEventQueue,
    @Inject(Providers.ILogger) readonly logger: ILogger,
  ) {
    super();
  };

  @OnQueueEvent('added')
  @SentryTransaction({ op: 'onQueueEvent-added', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onAdded(event: { jobId: string, name: string }, id: string) {
    this.logger.info(`Queue Job Added jobId: ${event.jobId} name: ${event.name} id: ${id}`);
    this.onAdded(event.jobId, event.name);
  }

  @OnQueueEvent('completed')
  @SentryTransaction({ op: 'onQueueEvent-completed', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onCompleted(event: { jobId: string, returnvalue: string, prev?: string}, id: string) {
    this.logger.info(`Queue Job Completed jobId: ${event.jobId} id: ${id}`);
    this.onCompleted(event.jobId, event.returnvalue);
  }

  @OnQueueEvent('delayed')
  @SentryTransaction({ op: 'onQueueEvent-delayed', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onDelayed(event: { jobId: string, delay: number }, id: string) {
    this.logger.info(`Queue Job Delayed jobId: ${event.jobId} delay: ${event.delay} id: ${id}`);
    this.jobEventQueue.trackDelayed(this.queueEvents.name, event.jobId, event.delay, id);

    this.onDelayed(event.jobId, event.delay, id);
  }

  @OnQueueEvent('error')
  @SentryTransaction({ op: 'onQueueEvent-error', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onError(error: Error) {
    this.logger.warn(`Queue Error ${error.message}`, error);
    await this.onError(error);
  }

  @OnQueueEvent('failed')
  @SentryTransaction({ op: 'onQueueEvent-failed', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onFailed(event: { jobId: string, failedReason: string, prev?: string }, id: string) {
    this.logger.warn(`Queue Job Failed jobId: ${event.jobId} failedReason: ${event.failedReason} id: ${id}`);
    await this.onFailed(event.jobId, event.failedReason, event.prev);
  }

  @OnQueueEvent('paused')
  @SentryTransaction({ op: 'onQueueEvent-paused', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onPaused(event: {}, id: string) {
    this.logger.info(`Queue Paused id: ${id}`);
    await this.onPaused();
  }

  @OnQueueEvent('removed')
  @SentryTransaction({ op: 'onQueueEvent-removed', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onRemoved(event: { jobId: string, prev: string }, id: string) {
    this.logger.info(`Queue Job Removed jobId: ${event.jobId} prev: ${event.prev} id: ${id}`);
    await this.onRemoved(event.jobId, event.prev);
  }

  @OnQueueEvent('resumed')
  @SentryTransaction({ op: 'onQueueEvent-resumed', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onResumed(event: {}, id: string) {
    this.logger.info(`Queue Resumed id: ${id}`);
    await this.onResumed();
  }

  @OnQueueEvent('waiting')
  @SentryTransaction({ op: 'onQueueEvent-waiting', startNewTrace: true, clearContextFor: DefaultClearContext })
  async _onWaiting(event: { jobId: string, prev?: string }, id: string) {
    this.logger.info(`Queue Job Waiting jobId: ${event.jobId} prev: ${event.prev} id: ${id}`);
    await this.onWaiting(event.jobId, event.prev);
  }

  /**
   * Listen to 'added' event.
   *
   * This event is triggered when a job is created.
   */
  async onAdded(jobId: string, name: string) { };

  /**
   * Listen to 'completed' event.
   *
   * This event is triggered when a job has successfully completed.
   */
  async onCompleted(jobId: string, returnvalue: string) { };

  /**
   * Listen to 'delayed' event.
   *
   * This event is triggered when a job is delayed.
   */
  async onDelayed(jobId: string, delay: number, id: string) { };

  /**
   * Listen to 'error' event.
   *
   * This event is triggered when an exception is thrown.
   */
  async onError(error: Error) { };

  /**
   * Listen to 'failed' event.
   *
   * This event is triggered when a job has thrown an exception.
   */
  async onFailed(jobId: string, failedReason: string, prev?: string) { };

  /**
   * Listen to 'paused' event.
   *
   * This event is triggered when a queue is paused.
   */
  async onPaused() { };

  /**
   * Listen to 'removed' event.
   *
   * This event is triggered when a job has been manually
   * removed from the queue.
   */
  async onRemoved(jobId: string, prev: string) { };

  /**
   * Listen to 'resumed' event.
   *
   * This event is triggered when a queue is resumed.
   */
  async onResumed() { };

  /**
   * Listen to 'waiting' event.
   *
   * This event is triggered when a job enters the 'waiting' state.
   */
  async onWaiting(jobId: string, prev?: string) { };


}
