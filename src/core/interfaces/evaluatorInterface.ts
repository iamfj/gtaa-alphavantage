export type Evaluation<ResponseData> = {
  symbol: string;
  data: ResponseData;
};

export type SymbolGroupedData<RequestData> = {
  [key: string]: RequestData;
};

export interface EvaluatorInterface<Options, RequestData, ResponseData> {
  evaluate(options: Options, data: SymbolGroupedData<RequestData>): Evaluation<ResponseData>[];
}
