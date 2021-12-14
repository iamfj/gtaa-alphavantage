import { SmaOptions } from '../dataSource/alphaVantageDataSource';
import { GtaaOptions } from '../evaluator/gtaaEvaluator';

export interface ConfigInterface {
  alphavantage: {
    key: string;
    delay: number;
    maxRetries: number;
  };
  sma: SmaOptions;
  gtaa: GtaaOptions;
  symbols: string[];
};
