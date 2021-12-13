import axios, { AxiosResponse } from "axios";
import { Response, Interval, MonthlyAdjustedTimeSeriesResponse, Series, SMAIndicatorResponse } from "../types/alphavantageTypes";

export class RequestClient {
  private readonly host: string = 'https://www.alphavantage.co';

  public constructor(private readonly key: string) {}

  private async resolve<T extends Response>(response: AxiosResponse<T>): Promise<AxiosResponse<T>> {
    if('Note' in response.data) {
      return Promise.reject(response.data.Note);
    }
    return Promise.resolve(response);
  }

  public async getMonthlyAdjusted(symbol: string): Promise<AxiosResponse<MonthlyAdjustedTimeSeriesResponse>> {
    return axios.get(`${this.host}/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}&apikey=${this.key}&datatype=json`).then(response => this.resolve(response));
  }

  public async getSma(symbol: string, interval: Interval, period: number, series: Series): Promise<AxiosResponse<SMAIndicatorResponse>> {
    return axios.get(`${this.host}/query?function=SMA&symbol=${symbol}&interval=${interval}&time_period=${period}&series_type=${series}&apikey=${this.key}&datatype=json`).then(response => this.resolve(response));
  }
}
