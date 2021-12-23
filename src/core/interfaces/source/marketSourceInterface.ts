export type CandleData = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketData = {
  [key: number]: CandleData;
};

export interface MarketSourceInterface {
  fetchMonthlyData(symbol: string): Promise<MarketData>;
}
