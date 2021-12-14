import { Logger } from "tslog";
import { AlphaVantageDataSource, MonthlyTimeSeries, SmaOptions, SmaTechnicalAnalysis } from "./dataSource/alphaVantageDataSource";
import { GtaaEvaluator, GtaaOptions } from "./evaluator/gtaaEvaluator";
import { RetryHandler } from "./handler/retryHandler";

export class App {
  public constructor(private readonly logger: Logger, private readonly alphaVantageDataSource: AlphaVantageDataSource, private readonly retryHandler: RetryHandler) {
    this.onRejectCallback = this.onRejectCallback.bind(this);
  }

  public async run(symbols: string[], smaOptions: SmaOptions, gtaaOptions: GtaaOptions): Promise<void> {
    const monthlyData = await this.fetchMonthlyData(symbols);
    const smaData = await this.fetchSmaData(symbols, smaOptions);

    const gtaaEvaluator = new GtaaEvaluator(this.logger, symbols, monthlyData, smaData);
    const gtaaEvaluations = gtaaEvaluator.evaluate(gtaaOptions);
    
    if(gtaaEvaluations.length === 0) {
      this.logger.info(`Could not find any valid evaluation`)
    } else {
      this.logger.info(`The following symbols were evaluated for the ${gtaaEvaluations[0].data.date}`);
    }
    
    for(const evaluation of gtaaEvaluations) {
      this.logger.info(` - ${evaluation.symbol}`);
    }
  }

  private onRejectCallback(retry: number, maxRetries: number, delay: number): void {
    this.logger.info(`Rejected! Waiting ${delay}s [${retry}/${maxRetries}]`);
  }

  private async fetchMonthlyData(symbols: string[]): Promise<MonthlyTimeSeries[]> {
    const responses: MonthlyTimeSeries[] = [];
    for (const symbol of symbols) {
      responses.push(await this.retryHandler.handle(() => this.alphaVantageDataSource.getMonthlyData(symbol), this.onRejectCallback));
      this.logger.info(`Fetched monthly data for ${symbol}`);
    }
    return Promise.resolve(responses);
  }

  private async fetchSmaData(symbols: string[], options: SmaOptions): Promise<SmaTechnicalAnalysis[]> {
    const responses: SmaTechnicalAnalysis[] = [];
    for (const symbol of symbols) {
      responses.push(await this.retryHandler.handle(() => this.alphaVantageDataSource.getSmaData(symbol, options), this.onRejectCallback));
      this.logger.info(`Fetched sma data for ${symbol}`);
    }
    return Promise.resolve(responses);
  }
}