import { AlphaVantageDataSource, Interval, SeriesType } from './dataSource/alphaVantageDataSource';
import { RetryHandler } from './handler/retryHandler';
import configFile from '../config.json';
import { Logger } from 'tslog';
import { ConfigInterface } from './interfaces/configInterface';
import { App } from './app';

const configuration: ConfigInterface = {
  alphavantage: configFile.alphavantage,
  gtaa: configFile.gtaa,
  symbols: configFile.symbols,
  sma: {
    ...configFile.sma,
    interval: <Interval>configFile.sma.interval,
    seriesType: <SeriesType>configFile.sma.seriesType
  },
};

const logger: Logger = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
});

// TODO: Why does the retry handler need the alphavantage specific config??
const alphaVantageDataSource = new AlphaVantageDataSource(configuration.alphavantage.key);
const retryHandler = new RetryHandler(logger, configuration.alphavantage.delay, configuration.alphavantage.maxRetries);

const app = new App(logger, alphaVantageDataSource, retryHandler);
app.run(configuration.symbols, configuration.sma, configuration.gtaa).then(() => {
  logger.info('Bye!');
}, (err) => {
  logger.error(err);
});
