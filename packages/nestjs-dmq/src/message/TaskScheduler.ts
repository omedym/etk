import { ILogger } from '@omedym/nestjs-telemetry';

import { ITaskGateway, ScheduleAtOptions, ScheduleEveryOptions } from './TaskGateway';
import { ITask } from './Task';


export abstract class AbstractTaskScheduler<T extends ITaskGateway> {
  protected readonly taskGateway: T;
  protected readonly logger: ILogger;

  scheduledTasks: { task: ITask; opts: ScheduleAtOptions | ScheduleEveryOptions }[] = [];

  constructor(taskGateway: T, logger: ILogger) {
    this.taskGateway = taskGateway;
    this.logger = logger;
  }

  async schedule() {
    this.logger.info(`Scheduling ${this.scheduledTasks.length} tasks in ${this.constructor.name}`);

    for (const taskToSchedule of this.scheduledTasks) {
      try {
        if ((taskToSchedule.opts as any)?.runAt) {
          await this.taskGateway.scheduleAt(taskToSchedule.task, taskToSchedule.opts as ScheduleAtOptions);
        } else {
          await this.taskGateway.scheduleEvery(taskToSchedule.task, taskToSchedule.opts as ScheduleEveryOptions);
        }
      } catch (e) {
        this.logger.error(`Failed to schedule task`, e);
      }
    }
  }

  registerTask(taskToSchedule: { task: ITask; opts: ScheduleAtOptions | ScheduleEveryOptions }) {
    this.scheduledTasks.push(taskToSchedule);
  }
}
