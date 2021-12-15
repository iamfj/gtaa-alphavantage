import NodeCache from "node-cache";
import { SmaOptions } from "./alphaVantageDataSource";

export type OnRetryCallback = (count: number, limit: number, delay: number) => void;

export type DataSourceOptions = {
  delay: number,
  limit: number
}

export abstract class DataSource<MonthlyData, SmaData> {
  protected abstract fetchMonthlyData(symbol: string): Promise<MonthlyData>;
  protected abstract fetchSmaData(symbol: string, smaOptions: SmaOptions): Promise<SmaData>;

  public constructor(public readonly name: string, private readonly cache: NodeCache, private readonly retryOptions: DataSourceOptions) {}

  public getMonthlyData(symbol: string, onRetryCallback?: OnRetryCallback): Promise<MonthlyData> {
    // Loading stored data from cache
    const cacheKey = this.getCacheKey('monthlyData', symbol);
    const cachedResponse: MonthlyData | undefined = this.cache.get(cacheKey);
    if(cachedResponse !== undefined) {
      return Promise.resolve(cachedResponse);
    }

    // Resolving and saving response data to cache
    return this.retry(() => this.fetchMonthlyData(symbol), onRetryCallback).then((monthlyData) => {
      if(!this.cache.set(cacheKey, monthlyData)) {
        return Promise.reject(`Could not write response for ${cacheKey} to cache`);
      }
      return Promise.resolve(monthlyData);
    });
  }

  public getSmaData(symbol: string, smaOptions: SmaOptions, onRetryCallback?: OnRetryCallback): Promise<SmaData> {
    // Loading stored data from cache
    const cacheKey = this.getCacheKey('smaData', symbol);
    const cachedResponse: SmaData | undefined = this.cache.get(cacheKey);
    if(cachedResponse !== undefined) {
      return Promise.resolve(cachedResponse);
    }

    // Resolving and saving response data to cache
    return this.retry(() => this.fetchSmaData(symbol, smaOptions), onRetryCallback).then((smaData) => {
      if(!this.cache.set(cacheKey, smaData)) {
        return Promise.reject(`Could not write response for ${cacheKey} to cache`);
      }
      return Promise.resolve(smaData);
    });
  }

  private getCacheKey(key: string, symbol: string): string {
    return `${this.name}_${key}_${symbol}`;
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