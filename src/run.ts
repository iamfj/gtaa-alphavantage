import { AlphaVantageDataSource, Interval, SeriesType, SmaOptions } from './dataSource/alphaVantageDataSource';
import { Logger } from 'tslog';
import { App } from './app';
import dotenv from 'dotenv';
import { GtaaOptions } from './evaluator/gtaaEvaluator';

dotenv.config();

const alphaVantageKey = process.env.ALPHAVANTAGE_KEY ?? '';
const retryDelay = parseInt(process.env.RETRY_DELAY ?? '15');
const retryMax = parseInt(process.env.RETRY_MAX ?? '10');
const gtaaTop = parseInt(process.env.GTAA_TOP ?? '5');
const gtaaShift = parseInt(process.env.GTAA_SHIFT ?? '1');
const smaInterval = <Interval>process.env.SMA_INTERVAL;
const smaTimePeriod = parseInt(process.env.SMA_TIME_PERIOD ?? '60');
const smaSeriesType = <SeriesType>process.env.SMA_INTERVAL;
const symbols = (process.env.SYMBOLS ?? '').split(',');

const logger: Logger = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
});

const alphaVantageDataSource = new AlphaVantageDataSource(alphaVantageKey, {
  delay: retryDelay,
  limit: retryMax
});

const smaOptions: SmaOptions = {
  interval: smaInterval,
  timePeriod: smaTimePeriod,
  seriesType: smaSeriesType
}

const gtaaOptions: GtaaOptions = {
  top: gtaaTop,
  shift: gtaaShift
}

const app = new App(logger, alphaVantageDataSource);
app.run(symbols, smaOptions, gtaaOptions).then(
  () => {
    logger.info('Bye!');
  },
  (err) => {
    logger.error(err);
  },
);
