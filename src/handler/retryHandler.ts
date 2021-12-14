import { Logger } from 'tslog';

export type OnRetryCallback = (retry: number, maxRetries: number, delay: number) => void;

export class RetryHandler {
  public constructor(private readonly logger: Logger, private readonly delay: number, private readonly maxRetries: number) {}

  public async handle<T>(taskCallback: () => Promise<T>, onRetryCallback: OnRetryCallback = () => {}): Promise<T> {
    let responseData: T | undefined = undefined;
    let retryCount: number = 0;

    while (responseData === undefined && retryCount++ < this.maxRetries) {
      try {
        responseData = await taskCallback();
      } catch (err: any) {
        onRetryCallback(retryCount, this.maxRetries, this.delay);
        await new Promise((resolve) => setTimeout(resolve, this.delay * 1000));
      }
    }

    if (responseData === undefined) {
      return Promise.reject(`Could not handle task after ${this.maxRetries}`);
    }
    return Promise.resolve(responseData);
  }
}
