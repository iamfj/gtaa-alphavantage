import { Logger } from 'tslog';
import { MonthlyTimeSeries, SmaTechnicalAnalysis } from '../dataSource/alphaVantageDataSource';
import { Evaluation, EvaluatorInterface } from '../interfaces/evaluatorInterface';

export type GtaaOptions = {
  top: number;
  shift: number;
};

export type GtaaIndicators = {
  sma: number;
  profit: number;
};

/**
 * @see https://papers.ssrn.com/sol3/papers.cfm?abstract_id=962461
 */
export class GtaaEvaluator implements EvaluatorInterface<GtaaOptions, GtaaIndicators> {
  public constructor(private readonly symbols: string[], private readonly monthlyData: MonthlyTimeSeries[], private readonly smaData: SmaTechnicalAnalysis[]) {}

  public evaluate(options: GtaaOptions): Evaluation<GtaaIndicators>[] {
    let results: Evaluation<GtaaIndicators>[] = [];

    for (let i = 0; i < this.symbols.length - 1; i++) {
      const symbol = this.symbols[i];
      const date = Object.keys(this.monthlyData[i]['Monthly Time Series'])[options.shift];
      const recentMonthlyData = this.monthlyData[i]['Monthly Time Series'][date];
      const open = recentMonthlyData['1. open'];
      const low = recentMonthlyData['3. low'];
      const high = recentMonthlyData['2. high'];
      const close = recentMonthlyData['4. close'];
      const profit = recentMonthlyData['4. close'] - recentMonthlyData['1. open'];
      const sma = this.smaData[i]['Technical Analysis: SMA'][date].SMA;

      if (close > sma && profit > 0) {
        results.push({
          symbol,
          data: { date, open, low, high, close },
          indicator: { sma, profit },
        });
      }
    }

    return results
      .sort((a, b) => a.indicator.profit - b.indicator.profit)
      .filter((result, i) => {
        return i < options.top;
      });
  }
}
