export interface DataSourceInterface<MonthlyData, SmaData, SmaOptions> {
  getMonthlyData(symbol: string): Promise<MonthlyData>;
  getSmaData(symbol: string, options: SmaOptions): Promise<SmaData>;
}
