import { Logger } from 'tslog';
import { SymbolGroupedData } from '../core/interfaces/evaluatorInterface';
import { ClientInterface } from '../core/interfaces/source/clientInterface';
import { IndicatorSourceInterface, SmaData, SmaOptions } from '../core/interfaces/source/indicatorSourceInterface';
import { MarketData, MarketSourceInterface } from '../core/interfaces/source/marketSourceInterface';
import { SourceInterface, TaskInterface } from '../core/interfaces/taskInterface';
import { GtaaEvaluator, GtaaOptions, GtaaSymbolData } from '../evaluator/gtaaEvaluator';

export type EvaluationTaskOptions = {
  symbols: string[];
  smaOptions: SmaOptions;
  gtaaOptions: GtaaOptions;
};

export type SymbolMarketData = {
  [key: string]: MarketData[]
}

export type SymbolSmaData = {
  [key: string]: number[]
}

export class EvaluationTask implements TaskInterface<EvaluationTaskOptions> {
  public constructor(private readonly logger: Logger, private readonly evaluator: GtaaEvaluator) {}

  public async run(client: ClientInterface, source: SourceInterface, options?: EvaluationTaskOptions): Promise<void> {
    if ((source as MarketSourceInterface).fetchMonthlyData === undefined || (source as IndicatorSourceInterface).fetchSmaData === undefined) {
      return Promise.reject('Data source does not support market data or indicator apis');
    }

    if (options === undefined) {
      return Promise.reject('No task options provided');
    }

    if (options.symbols.length <= 0) {
      return Promise.reject('No symbols provided');
    }

    const monthlyData = await this.fetchMonthlyDataForSymbols(options.symbols, client, source);
    const smaData = await this.fetchSmaDataForSymbols(options.symbols, options.smaOptions, client, source);
    const evaluations = this.evaluator.evaluate(options.gtaaOptions, this.mergeDataForGtaa(monthlyData, smaData));

    if (evaluations.length === 0) {
      this.logger.info(`Could not find any valid evaluation`);
    } else {
      this.logger.info(`The following symbols were evaluated for the ${evaluations[0].data.date}`);
    }

    for (const evaluation of evaluations) {
      const formattedProfit = (evaluation.data.monthlyProfit.relative * 100).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        minimumIntegerDigits: 2, 
        useGrouping: false
      });
      this.logger.info(` - ${evaluation.symbol} [Profit ${formattedProfit}%]`);
    }
  }

  private mergeDataForGtaa(monthlyData: SymbolGroupedData<MarketData>, smaData: SymbolGroupedData<SmaData>): SymbolGroupedData<GtaaSymbolData> {
    const gtaaData: SymbolGroupedData<GtaaSymbolData> = {};
    for(const symbol of Object.keys(monthlyData)) {
      gtaaData[symbol] = {
        monthlyData: monthlyData[symbol],
        smaData: smaData[symbol]
      }
    }
    return gtaaData;
  }

  private async fetchMonthlyDataForSymbols(symbols: string[], client: ClientInterface, source: SourceInterface): Promise<SymbolGroupedData<MarketData>> {
    const monthlyData: SymbolGroupedData<MarketData> = {};
    for (const symbol of symbols) {
      monthlyData[symbol] = await client.fetch(() => (source as MarketSourceInterface).fetchMonthlyData(symbol));
      this.logger.info(`Fetched ${Object.keys(monthlyData[symbol]).length} monthly data sets for ${symbol}`);
    }
    return Promise.resolve(monthlyData);
  }

  private async fetchSmaDataForSymbols(symbols: string[], options: SmaOptions, client: ClientInterface, source: SourceInterface): Promise<SymbolGroupedData<SmaData>> {
    const smaData: SymbolGroupedData<SmaData> = {};
    for (const symbol of symbols) {
      smaData[symbol] = await client.fetch(() => (source as IndicatorSourceInterface).fetchSmaData(symbol, options));
      this.logger.info(`Fetched ${Object.keys(smaData[symbol]).length} sma data sets for ${symbol}`);
    }
    return Promise.resolve(smaData);
  }
}
