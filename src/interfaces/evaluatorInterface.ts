// TODO: The data should be generalized
// TODO: Why is date handled as a string?
export interface Evaluation<Indicators> {
  symbol: string;
  data: {
    date: string;
    open: number;
    low: number;
    high: number;
    close: number;
  };
  indicator: Indicators;
};

export interface EvaluatorInterface<Options, Indicators> {
  evaluate(options: Options): Evaluation<Indicators>[];
}
