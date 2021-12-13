import { Interval, Series } from './alphavantageTypes';

export type Options = {
  top: number;
  shift: number;
  interval: Interval;
  period: number;
  series: Series;
};

export type Result = {
  symbol: string;
  data: {
    date: string;
    open: number;
    low: number;
    high: number;
    close: number;
  };
  indicator: {
    sma: number;
    profit: number;
  };
};
