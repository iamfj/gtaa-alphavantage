import { Options } from './gtaaTypes';

export type Config = {
  alphavantage: {
    key: string;
    delay: number;
    maxRetries: number;
  };
  gtaa: {
    options: Options;
    symbols: string[];
  };
};
