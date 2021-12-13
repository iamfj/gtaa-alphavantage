import { RequestClient } from './alphavantage/requestClient';
import { DelayedClient } from './util/delayedClient';
import c from '../config.json';
import { GTAA } from './gtaa';
import { Logger } from 'tslog';
import { Interval, Series } from './types/alphavantageTypes';
import { Config } from './types/configTypes';

const config: Config = {
  alphavantage: c.alphavantage,
  gtaa: {
    options: {
      interval: <Interval>c.gtaa.options.interval,
      period: c.gtaa.options.period,
      series: <Series>c.gtaa.options.series,
      top: c.gtaa.options.top,
      shift: c.gtaa.options.shift,
    },
    symbols: c.gtaa.symbols,
  },
};

const logger: Logger = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
});

const requestClient = new RequestClient(config.alphavantage.key);
const delayedClient = new DelayedClient(logger, config.alphavantage.delay, config.alphavantage.maxRetries);
const gtaa = new GTAA(logger, requestClient, delayedClient);

gtaa.run(config.gtaa.symbols, config.gtaa.options).then(
  (calculations) => {
    logger.info(`You should hold the following symbols next month:`);
    for (const calculation of calculations) {
      logger.info(`${calculation.symbol}`);
    }
    logger.info(`BYE!`);
  },
  (err) => {
    console.error(err);
  },
);
