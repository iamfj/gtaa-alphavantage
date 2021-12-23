import { Evaluation, EvaluatorInterface, SymbolGroupedData } from '../core/interfaces/evaluatorInterface';
import { CandleData, MarketData } from '../core/interfaces/source/marketSourceInterface';
import { SmaData } from '../core/interfaces/source/indicatorSourceInterface';

export type GtaaOptions = {
  top: number;
  shift: number;
};

export type GtaaSymbolData = {
  monthlyData: MarketData;
  smaData: SmaData;
};

export type GtaaProfit = {
  absolute: number,
  relative: number
}

export type GtaaEvaluationData = {
  date: Date;
  monthlyCandle: CandleData;
  monthlyProfit: GtaaProfit;
  dailySma: number;
};

/**
 * @see https://papers.ssrn.com/sol3/papers.cfm?abstract_id=962461
 */
export class GtaaEvaluator implements EvaluatorInterface<GtaaOptions, GtaaSymbolData, GtaaEvaluationData> {
  public evaluate(options: GtaaOptions, data: SymbolGroupedData<GtaaSymbolData>): Evaluation<GtaaEvaluationData>[] {
    let results: Evaluation<GtaaEvaluationData>[] = [];

    for (const symbol of Object.keys(data)) {
      const symbolData = data[symbol];
      const recentUnixDate = parseInt(Object.keys(symbolData.monthlyData).sort((a, b) => parseInt(b) - parseInt(a))[options.shift]);
      const recentMonthlyCandle = symbolData.monthlyData[recentUnixDate];
      const recentMonthlyProfit: GtaaProfit = {
        absolute: recentMonthlyCandle.close - recentMonthlyCandle.open,
        relative: (recentMonthlyCandle.close / recentMonthlyCandle.open) - 1
      };
      const recentDailySma = symbolData.smaData[recentUnixDate];

      if (recentMonthlyCandle.close > recentDailySma && recentMonthlyProfit.relative > 0) {
        results.push({
          symbol,
          data: {
            date: new Date(recentUnixDate),
            monthlyCandle: recentMonthlyCandle,
            monthlyProfit: recentMonthlyProfit,
            dailySma: recentDailySma,
          },
        });
      }
    }

    return results
      .sort((a, b) => b.data.monthlyProfit.relative - a.data.monthlyProfit.relative)
      .filter((_result, i) => {
        return i < options.top;
      });
  }
}
