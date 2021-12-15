import { SmaOptions } from "./alphaVantageDataSource";

export type OnRetryCallback = (count: number, limit: number, delay: number) => void;

export type DataSourceOptions = {
  delay: number,
  limit: number
}

export abstract class DataSource<MonthlyData, SmaData> {
  protected abstract fetchMonthlyData(symbol: string): Promise<MonthlyData>;
  protected abstract fetchSmaData(symbol: string, smaOptions: SmaOptions): Promise<SmaData>;

  public constructor(private readonly retryOptions: DataSourceOptions) {}

  public getMonthlyData(symbol: string, onRetryCallback?: OnRetryCallback): Promise<MonthlyData> {
    return this.retry(() => this.fetchMonthlyData(symbol), onRetryCallback);
  }

  public getSmaData(symbol: string, smaOptions: SmaOptions, onRetryCallback?: OnRetryCallback): Promise<SmaData> {
    return this.retry(() => this.fetchSmaData(symbol, smaOptions), onRetryCallback);
  }

  private async retry<T>(request: () => Promise<T>, onRetryCallback?: OnRetryCallback): Promise<T> {
    let count: number = 0;

    while (count++ < this.retryOptions.limit) {
      try {
        return Promise.resolve(await request());
      } catch (err: any) {
        if(onRetryCallback !== undefined) {
          onRetryCallback(count, this.retryOptions.limit, this.retryOptions.delay);
        }
        await new Promise((resolve) => setTimeout(resolve, this.retryOptions.delay * 1000));
      }
    }

    return Promise.reject(`Could not execute request after ${this.retryOptions.limit} retries`);
  }
}