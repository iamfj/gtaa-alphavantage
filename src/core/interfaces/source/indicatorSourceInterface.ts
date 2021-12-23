export type SeriesType = 'open' | 'low' | 'high' | 'close';

export type Series = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1D' | '1W' | '1M';

export type SmaData = {
  [key: number]: number;
};

export type SmaOptions = {
  series: Series;
  seriesType: SeriesType;
  periods: number;
};

export interface IndicatorSourceInterface {
  fetchSmaData(symbol: string, options: SmaOptions): Promise<SmaData>;
}
