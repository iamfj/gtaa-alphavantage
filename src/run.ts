import { AlphaVantageSource } from './source/alphaVantageSource';
import { Logger } from 'tslog';
import { App } from './app';
import { GtaaEvaluator, GtaaOptions } from './evaluator/gtaaEvaluator';
import { RetryFetchClient } from './core/client/retryFetchClient';
import { EvaluationTask, EvaluationTaskOptions } from './task/evaluationTask';
import { Series, SeriesType, SmaOptions } from './core/interfaces/source/indicatorSourceInterface';
import dotenv from 'dotenv';

dotenv.config();

// Defining variables from environment
const alphaVantageKey = process.env.ALPHAVANTAGE_KEY ?? '';
const alphaVantageDelay = parseInt(process.env.ALPHAVANTAGE_DELAY ?? '15');
const alphaVantageLimit = parseInt(process.env.ALPHAVANTAGE_LIMIT ?? '10');
const gtaaTop = parseInt(process.env.GTAA_TOP ?? '5');
const gtaaShift = parseInt(process.env.GTAA_SHIFT ?? '1');
const smaSeries = <Series>process.env.SMA_SERIES;
const smaSeriesType = <SeriesType>process.env.SMA_SERIES_TYPE;
const smaPeriods = parseInt(process.env.SMA_PERIODS ?? '60');
const symbols = (process.env.SYMBOLS ?? '').split(',');

// Create class instances
const logger: Logger = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
});

const client = new RetryFetchClient(logger, {
  delay: alphaVantageDelay,
  limit: alphaVantageLimit,
});

const alphaVantageSource = new AlphaVantageSource(alphaVantageKey);

const smaOptions: SmaOptions = {
  series: smaSeries,
  seriesType: smaSeriesType,
  periods: smaPeriods,
};

const gtaaOptions: GtaaOptions = {
  top: gtaaTop,
  shift: gtaaShift,
};

const gtaaEvaluator = new GtaaEvaluator();

const app = new App(client, alphaVantageSource);
const evaluationTask = new EvaluationTask(logger, gtaaEvaluator);
const evaluationTaskOptions: EvaluationTaskOptions = { symbols, gtaaOptions, smaOptions };

app.run(evaluationTask, evaluationTaskOptions).then(
  () => {
    logger.info('Bye!');
  },
  (err) => {
    logger.error(err);
  },
);
