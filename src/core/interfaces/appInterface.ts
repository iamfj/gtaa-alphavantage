import { TaskInterface } from './taskInterface';

export interface AppInterface {
  run(task: TaskInterface<any>, options?: any): Promise<void>;
}
