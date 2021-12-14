export type Interval = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';
export type Series = 'open' | 'low' | 'high' | 'close';
export type Response = MonthlyTimeSeriesResponse | SmaTechnicalAnalysisResponse | ErrorResponse;

export type ErrorResponse = {
  Note: string;
};

export type TimeSeriesResponse = {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
};

export type MonthlyTimeSeriesResponse = TimeSeriesResponse & {
  'Monthly Time Series': {
    [key: string]: {
      '1. open': number;
      '2. high': number;
      '3. low': number;
      '4. close': number;
      '5. volume': number;
    };
  };
};

export type TechnicalAnalysisResponse = {
  'Meta Data': {
    '1. Symbol': string;
    '2. Indicator': string;
    '3. Last Refreshed': string;
    '4. Interval': Interval;
    '5. Time Period': number;
    '6. Series Type': Series;
    '7. Time Zone': string;
  };
};

export type SmaTechnicalAnalysisResponse = TechnicalAnalysisResponse & {
  'Technical Analysis: SMA': {
    [key: string]: {
      SMA: number;
    };
  };
};