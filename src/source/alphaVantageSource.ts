import axios, { AxiosResponse } from 'axios';
import { IndicatorSourceInterface, SmaData } from '../core/interfaces/source/indicatorSourceInterface';
import { MarketData, MarketSourceInterface } from '../core/interfaces/source/marketSourceInterface';

export type Interval = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';
export type SeriesType = 'open' | 'low' | 'high' | 'close';
type Response = MonthlyTimeSeriesResponse | SmaTechnicalAnalysisResponse | ErrorResponse;

type ErrorResponse = {
  Note: string;
};

type TimeSeriesResponse = {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
};

type MonthlyTimeSeriesResponse = TimeSeriesResponse & {
  'Monthly Time Series': {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
};

type TechnicalAnalysisResponse = {
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

type SmaTechnicalAnalysisResponse = TechnicalAnalysisResponse & {
  'Technical Analysis: SMA': {
    [key: string]: {
      SMA: string;
    };
  };
};

export type AlphaVantageSmaOptions = {
  interval: Interval;
  timePeriod: number;
  seriesType: SeriesType;
};

/**
 * @see https://www.alphavantage.co/documentation/
 */
export class AlphaVantageSource implements MarketSourceInterface, IndicatorSourceInterface<AlphaVantageSmaOptions> {
  private readonly host: string = 'https://www.alphavantage.co';

  public constructor(private readonly key: string) {};

  private async catchErrorReponse<T extends Response>(response: AxiosResponse<T>): Promise<T> {
    // As note is only present in error messages just reject when note is present
    if ('Note' in response.data) {
      return Promise.reject(response.data.Note);
    }
    return Promise.resolve(response.data);
  }

  private transformMonthlyDataResponse(response: MonthlyTimeSeriesResponse): MarketData {
    let monthlyData: MarketData = {};
    for(const dateString of Object.keys(response['Monthly Time Series'])) {
      monthlyData[new Date(dateString).valueOf()] = {
        open: parseFloat(response['Monthly Time Series'][dateString]['1. open']),
        low: parseFloat(response['Monthly Time Series'][dateString]['3. low']),
        high: parseFloat(response['Monthly Time Series'][dateString]['2. high']),
        close: parseFloat(response['Monthly Time Series'][dateString]['4. close']),
        volume: parseFloat(response['Monthly Time Series'][dateString]['5. volume'])
      }
    }
    return monthlyData;
  }

  public async fetchMonthlyData(symbol: string): Promise<MarketData> {
    const url = `${this.host}/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${this.key}&datatype=json`;
    try {
      return Promise.resolve(this.transformMonthlyDataResponse(await axios.get(url).then((response) => this.catchErrorReponse(response))));
    } catch(err: any) {
      return Promise.reject(err);
    }
  }

  private transformSmaDataResponse(response: SmaTechnicalAnalysisResponse): SmaData {
    let smaData: SmaData = {};
    for(const dateString of Object.keys(response['Technical Analysis: SMA'])) {
      smaData[new Date(dateString).valueOf()] = parseFloat(response['Technical Analysis: SMA'][dateString].SMA)
    }
    return smaData;
  }

  public async fetchSmaData(symbol: string, options: AlphaVantageSmaOptions): Promise<SmaData> {
    const url = `${this.host}/query?function=SMA&symbol=${symbol}&interval=${options.interval}&time_period=${options.timePeriod}&series_type=${options.seriesType}&apikey=${this.key}&datatype=json`;
    try {
      return Promise.resolve(this.transformSmaDataResponse(await axios.get(url).then((response) => this.catchErrorReponse(response))));
    } catch(err: any) {
      return Promise.reject(err);
    }
  }
}
