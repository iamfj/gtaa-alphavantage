export type SmaData = {
  [key: number]: number
}

export interface IndicatorSourceInterface<SmaOptions> {
  fetchSmaData(symbol: string, options: SmaOptions): Promise<SmaData>;
}
