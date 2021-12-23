import { ClientInterface } from './core/interfaces/source/clientInterface';
import { AppInterface } from './core/interfaces/appInterface';
import { SourceInterface, TaskInterface } from './core/interfaces/taskInterface';

export class App implements AppInterface {
  public constructor(private readonly client: ClientInterface, private readonly source: SourceInterface) {}

  public async run(task: TaskInterface<any>, options?: any): Promise<void> {
    return task.run(this.client, this.source, options);
  }
}
