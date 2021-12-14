import axios, { AxiosResponse } from 'axios';
import { DataSourceInterface } from '../interfaces/dataSourceInterface';

export type Interval = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';
export type SeriesType = 'open' | 'low' | 'high' | 'close';
export type Response = MonthlyTimeSeries | SmaTechnicalAnalysis | ErrorResponse;

export type ErrorResponse = {
  Note: string;
};

export type TimeSeries = {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
};

export type MonthlyTimeSeries = TimeSeries & {
  'Monthly Time Series': {
    [key: string]: {
      '1. open': number;
      '2. high': number;
      '3. low': number;
      '4. close': number;
      '5. volume': number;
    };
  };
};

export type TechnicalAnalysis = {
  'Meta Data': {
    '1. Symbol': string;
    '2. Indicator': string;
    '3. Last Refreshed': string;
    '4. Interval': Interval;
    '5. Time Period': number;
    '6. Series Type': SeriesType;
    '7. Time Zone': string;
  };
};

export type SmaTechnicalAnalysis = TechnicalAnalysis & {
  'Technical Analysis: SMA': {
    [key: string]: {
      SMA: number;
    };
  };
};

export type SmaOptions = {
  interval: Interval;
  timePeriod: number;
  seriesType: SeriesType;
};

export class AlphaVantageDataSource implements DataSourceInterface<MonthlyTimeSeries, SmaTechnicalAnalysis, SmaOptions> {
  private readonly host: string = 'https://www.alphavantage.co';

  public constructor(private readonly key: string) {}

  public async getMonthlyData(symbol: string): Promise<MonthlyTimeSeries> {
    const url = `${this.host}/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${this.key}&datatype=json`;
    return axios.get(url).then((response) => this.rejectError(response));
  }

  public async getSmaData(symbol: string, options: SmaOptions): Promise<SmaTechnicalAnalysis> {
    const url = `${this.host}/query?function=SMA&symbol=${symbol}&interval=${options.interval}&time_period=${options.timePeriod}&series_type=${options.seriesType}&apikey=${this.key}&datatype=json`;
    return axios.get(url).then((response) => this.rejectError(response));
  }

  private async rejectError<T extends Response>(response: AxiosResponse<T>): Promise<T> {
    // As note is only present in error messages just reject when note is present
    if ('Note' in response.data) {
      return Promise.reject(response.data.Note);
    }
    return Promise.resolve(response.data);
  }
}
