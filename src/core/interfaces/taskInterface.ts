import { ClientInterface } from "./source/clientInterface";
import { FundamentalSourceInterface } from "./source/fundamentalSourceInterface";
import { IndicatorSourceInterface } from "./source/indicatorSourceInterface";
import { MarketSourceInterface } from "./source/marketSourceInterface";

export type SourceInterface = FundamentalSourceInterface | IndicatorSourceInterface | MarketSourceInterface;

export interface TaskInterface<O> {
  run(client: ClientInterface, source: SourceInterface, options?: O): Promise<void>;
}