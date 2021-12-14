import axios, { AxiosResponse } from 'axios';
import { Response, Interval, MonthlyTimeSeriesResponse, Series, SmaTechnicalAnalysisResponse } from '../types/alphavantageTypes';

export class RequestClient {
  private readonly host: string = 'https://www.alphavantage.co';

  public constructor(private readonly key: string) {}

  private async resolve<T extends Response>(response: AxiosResponse<T>): Promise<AxiosResponse<T>> {
    // As note is only present in error messages just reject when note is present
    if ('Note' in response.data) {
      return Promise.reject(response.data.Note);
    }
    return Promise.resolve(response);
  }

  public async requestMonthlyTimeSeries(symbol: string): Promise<AxiosResponse<MonthlyTimeSeriesResponse>> {
    return axios.get(`${this.host}/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${this.key}&datatype=json`).then((response) => this.resolve(response));
  }

  public async requestSmaTechnicalAnalysisData(symbol: string, interval: Interval, period: number, series: Series): Promise<AxiosResponse<SmaTechnicalAnalysisResponse>> {
    return axios
      .get(`${this.host}/query?function=SMA&symbol=${symbol}&interval=${interval}&time_period=${period}&series_type=${series}&apikey=${this.key}&datatype=json`)
      .then((response) => this.resolve(response));
  }
}
