import { RequestClient } from './alphavantage/requestClient';
import { DelayedClient } from './util/delayedClient';
import { Logger } from 'tslog';
import { MonthlyAdjustedTimeSeriesResponse, SMAIndicatorResponse } from './types/alphavantageTypes';
import { AxiosResponse } from 'axios';
import { Options, Result } from './types/gtaaTypes';

export class GTAA {
  public constructor(private readonly logger: Logger, private readonly requestClient: RequestClient, private readonly delayedClient: DelayedClient) {}

  public async run(symbols: string[], options: Options): Promise<Result[]> {
    this.logger.info(`Start fetching data`);
    const monthlyAdjusted: AxiosResponse<MonthlyAdjustedTimeSeriesResponse>[] = await this.fetchMonthlyAdjusted(symbols);
    const sma: AxiosResponse<SMAIndicatorResponse>[] = await this.fetchSma(symbols, options);
    this.logger.info(`Finished fetching of data`);

    this.logger.info(`Start calculating the GTAA data`);
    const calculations = await this.calculate(
      symbols,
      options.top,
      options.shift,
      monthlyAdjusted.map((resp) => resp.data),
      sma.map((resp) => resp.data),
    );
    this.logger.info(`Finished calculating the GTAA data`);

    return Promise.resolve(calculations);
  }

  private async calculate(symbols: string[], top: number, shift: number, monthlySet: MonthlyAdjustedTimeSeriesResponse[], smaSet: SMAIndicatorResponse[]): Promise<Result[]> {
    let results: Result[] = [];

    for (let i = 0; i < symbols.length - 1; i++) {
      const symbol = symbols[i];
      const date = Object.keys(monthlySet[i]['Monthly Adjusted Time Series'])[shift];
      const recentMonthlyData = monthlySet[i]['Monthly Adjusted Time Series'][date];
      const open = recentMonthlyData['1. open'];
      const low = recentMonthlyData['3. low'];
      const high = recentMonthlyData['2. high'];
      const close = recentMonthlyData['4. close'];
      const profit = recentMonthlyData['4. close'] - recentMonthlyData['1. open'];
      const sma = smaSet[i]['Technical Analysis: SMA'][date].SMA;

      this.logger.info(`${symbol}: ${date} | SMA ${sma} | OPEN ${open} | LOW ${low} | HIGH ${high} | CLOSE ${close} | PROFIT ${profit}`);

      if (close > sma && profit > 0) {
        results.push({
          symbol,
          data: { date, open, low, high, close },
          indicator: { sma, profit },
        });
      }
    }

    return Promise.resolve(
      results
        .sort((a, b) => a.indicator.profit - b.indicator.profit)
        .filter((result, i) => {
          return i < top;
        }),
    );
  }

  private async fetchMonthlyAdjusted(symbols: string[]): Promise<any> {
    const responses: AxiosResponse<MonthlyAdjustedTimeSeriesResponse>[] = [];
    for (const symbol of symbols) {
      responses.push(await this.delayedClient.execute(() => this.requestClient.getMonthlyAdjusted(symbol)));
      this.logger.info(`Fetched adjusted monthly market data for ${symbol}`);
    }
    return Promise.resolve(responses);
  }

  private async fetchSma(symbols: string[], options: Options): Promise<any> {
    const responses: AxiosResponse<SMAIndicatorResponse>[] = [];
    for (const symbol of symbols) {
      responses.push(await this.delayedClient.execute(() => this.requestClient.getSma(symbol, options.interval, options.period, options.series)));
      this.logger.info(`Fetched sma indicator for ${symbol}`);
    }
    return Promise.resolve(responses);
  }
}
