import { Logger } from "tslog";

export class DelayedClient {
  public constructor(private readonly logger: Logger, private readonly delay: number, private readonly maxRetries: number) {}

  public async execute(cb: () => Promise<any>): Promise<any> {
    let data: any | undefined = undefined;
    let retries: number = 0;
    
    while(data === undefined && retries++ < this.maxRetries) {
      try {
        data = await cb();
      } catch(err: any) {
        this.logger.info(`Rejected! Waiting ${this.delay}s ...`);
        await new Promise(resolve => setTimeout(resolve, this.delay * 1000));
      }
    }

    if(this.delay === undefined) {
      return Promise.reject(`Could not execute request after ${this.maxRetries} in ${this.maxRetries * this.delay}s`);
    }
    return Promise.resolve(data);
  }
}