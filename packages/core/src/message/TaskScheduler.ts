import { ILogger } from '../telemetry';
import { ITaskGateway, ITaskGatewayDefinition } from './TaskGateway';
import { ITask } from './Task';


export abstract class AbstractTaskScheduler<
  TDefinition extends ITaskGatewayDefinition = ITaskGatewayDefinition,
  T extends ITask = any,
> {
  protected readonly taskGateway: ITaskGateway<TDefinition, T>;
  protected readonly logger: ILogger;

  constructor(
    taskGateway: ITaskGateway<TDefinition, T>,
    logger: ILogger,
  ) {
    this.taskGateway = taskGateway;
    this.logger = logger;

    this.register();
  }

  async register() {
    this.logger.info(`Registering scheduled tasks in ${this.constructor.name}`);
    await this.schedule();
  }

  abstract schedule(): Promise<void>
}
