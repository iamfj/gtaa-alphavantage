import { Logger } from 'tslog';
import { FetchClient } from './fetchClient';

export type RetryFetchCLientOptions = {
  delay: number;
  limit: number;
};

export class RetryFetchClient extends FetchClient {
  public constructor(private readonly logger: Logger, private readonly options: RetryFetchCLientOptions) {
    super();
  }

  public async fetch<R>(request: () => Promise<R>): Promise<R> {
    let count: number = 0;
    let errors: any[] = [];

    while (count++ < this.options.limit) {
      try {
        return Promise.resolve(await request());
      } catch (err: any) {
        this.logger.info(`Request was rejected! Waiting ${this.options.delay}s [${count}/${this.options.limit}]`);
        errors.push(err);
        await new Promise((resolve) => setTimeout(resolve, this.options.delay * 1000));
      }
    }

    return Promise.reject(`Could not execute request after ${this.options.limit} retries! \n\t${errors.join('\n\t')}`);
  }
}
