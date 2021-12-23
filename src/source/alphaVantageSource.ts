import axios, { AxiosResponse } from 'axios';
import { ValidationError } from '../core/error/validationError';
import { IndicatorSourceInterface, SeriesType, SmaData, SmaOptions } from '../core/interfaces/source/indicatorSourceInterface';
import { MarketData, MarketSourceInterface } from '../core/interfaces/source/marketSourceInterface';

export type AlphaVantageSeries = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';

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
    '4. Interval': AlphaVantageSeries;
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

export type AlphaVantageSmaOptions = SmaOptions & {
  alphaVantageSeries?: AlphaVantageSeries;
};

/**
 * @see https://www.alphavantage.co/documentation/
 */
export class AlphaVantageSource implements MarketSourceInterface, IndicatorSourceInterface {
  private readonly host: string = 'https://www.alphavantage.co';

  public constructor(private readonly key: string) {}

  private async catchErrorReponse<T extends Response>(response: AxiosResponse<T>): Promise<T> {
    // As note is only present in error messages just reject when note is present
    if ('Note' in response.data) {
      return Promise.reject(response.data.Note);
    }
    return Promise.resolve(response.data);
  }

  private transformMonthlyDataResponse(response: MonthlyTimeSeriesResponse): MarketData {
    let monthlyData: MarketData = {};
    for (const dateString of Object.keys(response['Monthly Time Series'])) {
      monthlyData[new Date(dateString).valueOf()] = {
        open: parseFloat(response['Monthly Time Series'][dateString]['1. open']),
        low: parseFloat(response['Monthly Time Series'][dateString]['3. low']),
        high: parseFloat(response['Monthly Time Series'][dateString]['2. high']),
        close: parseFloat(response['Monthly Time Series'][dateString]['4. close']),
        volume: parseFloat(response['Monthly Time Series'][dateString]['5. volume']),
      };
    }
    return monthlyData;
  }

  public async fetchMonthlyData(symbol: string): Promise<MarketData> {
    const url = `${this.host}/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${this.key}&datatype=json`;
    try {
      return Promise.resolve(this.transformMonthlyDataResponse(await axios.get(url).then((response) => this.catchErrorReponse(response))));
    } catch (err: any) {
      return Promise.reject(err);
    }
  }

  private transformSmaDataResponse(response: SmaTechnicalAnalysisResponse): SmaData {
    let smaData: SmaData = {};
    for (const dateString of Object.keys(response['Technical Analysis: SMA'])) {
      smaData[new Date(dateString).valueOf()] = parseFloat(response['Technical Analysis: SMA'][dateString].SMA);
    }
    return smaData;
  }

  private transformSmaOptions(smaOptions: SmaOptions): AlphaVantageSmaOptions {
    if (smaOptions.periods < 1) {
      throw new ValidationError(`The sma periods should be 1 or greater`);
    }

    const seriesMap: {
      [key: string]: AlphaVantageSeries;
    } = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '60min',
      '1D': 'daily',
      '1W': 'weekly',
      '1M': 'monthly',
    };

    if (!Object.keys(seriesMap).includes(smaOptions.series)) {
      throw new ValidationError(`The sma ${smaOptions.series} series is not supported by the alpha vantage api`);
    }

    return {
      ...smaOptions,
      alphaVantageSeries: seriesMap[smaOptions.series],
    };
  }

  public async fetchSmaData(symbol: string, options: SmaOptions): Promise<SmaData> {
    try {
      const alphaVantageSmaOptions = this.transformSmaOptions(options);
      const url = `${this.host}/query?function=SMA&symbol=${symbol}&interval=${alphaVantageSmaOptions.alphaVantageSeries}&time_period=${alphaVantageSmaOptions.periods}&series_type=${alphaVantageSmaOptions.seriesType}&apikey=${this.key}&datatype=json`;
      return Promise.resolve(this.transformSmaDataResponse(await axios.get(url).then((response) => this.catchErrorReponse(response))));
    } catch (err: any) {
      return Promise.reject(err);
    }
  }
}
