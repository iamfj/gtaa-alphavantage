export type FundamentalReport = {
  fiscalDateEnding: Date;
  reportedCurrency: string;
};

export type IncomeReport = FundamentalReport & {
  grossProfit?: number;
  totalRevenue?: number;
  costOfRevenue?: number;
  costofGoodsAndServicesSold?: number;
  operatingIncome?: number;
  sellingGeneralAndAdministrative?: number;
  researchAndDevelopment?: number;
  operatingExpenses?: number;
  investmentIncomeNet?: number;
  netInterestIncome?: number;
  interestIncome?: number;
  interestExpense?: number;
  nonInterestIncome?: number;
  otherNonOperatingIncome?: number;
  depreciation?: number;
  depreciationAndAmortization?: number;
  incomeBeforeTax?: number;
  incomeTaxExpense?: number;
  interestAndDebtExpense?: number;
  netIncomeFromContinuingOperations?: number;
  comprehensiveIncomeNetOfTax?: number;
  ebit?: number;
  ebitda?: number;
  netIncome?: number;
};

export type BalanceReport = FundamentalReport & {
  totalAssets?: number;
  totalCurrentAssets?: number;
  cashAndCashEquivalentsAtCarryingValue?: number;
  cashAndShortTermInvestments?: number;
  inventory?: number;
  currentNetReceivables?: number;
  totalNonCurrentAssets?: number;
  propertyPlantEquipment?: number;
  accumulatedDepreciationAmortizationPPE?: number;
  intangibleAssets?: number;
  intangibleAssetsExcludingGoodwill?: number;
  goodwill?: number;
  investments?: number;
  longTermInvestments?: number;
  shortTermInvestments?: number;
  otherCurrentAssets?: number;
  otherNonCurrrentAssets?: number;
  totalLiabilities?: number;
  totalCurrentLiabilities?: number;
  currentAccountsPayable?: number;
  deferredRevenue?: number;
  currentDebt?: number;
  shortTermDebt?: number;
  totalNonCurrentLiabilities?: number;
  capitalLeaseObligations?: number;
  longTermDebt?: number;
  currentLongTermDebt?: number;
  longTermDebtNoncurrent?: number;
  shortLongTermDebtTotal?: number;
  otherCurrentLiabilities?: number;
  otherNonCurrentLiabilities?: number;
  totalShareholderEquity?: number;
  treasuryStock?: number;
  retainedEarnings?: number;
  commonStock?: number;
  commonStockSharesOutstanding?: number;
};

export type CashFlowReport = FundamentalReport & {
  operatingCashflow?: number;
  paymentsForOperatingActivities?: number;
  proceedsFromOperatingActivities?: number;
  changeInOperatingLiabilities?: number;
  changeInOperatingAssets?: number;
  depreciationDepletionAndAmortization?: number;
  capitalExpenditures?: number;
  changeInReceivables?: number;
  changeInInventory?: number;
  profitLoss?: number;
  cashflowFromInvestment?: number;
  cashflowFromFinancing?: number;
  proceedsFromRepaymentsOfShortTermDebt?: number;
  paymentsForRepurchaseOfCommonStock?: number;
  paymentsForRepurchaseOfEquity?: number;
  paymentsForRepurchaseOfPreferredStockv?: number;
  dividendPayout?: number;
  dividendPayoutCommonStock?: number;
  dividendPayoutPreferredStock?: number;
  proceedsFromIssuanceOfCommonStock?: number;
  proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet?: number;
  proceedsFromIssuanceOfPreferredStock?: number;
  proceedsFromRepurchaseOfEquity?: number;
  proceedsFromSaleOfTreasuryStock?: number;
  changeInCashAndCashEquivalents?: number;
  changeInExchangeRate?: number;
  netIncome?: number;
};

export type EarningReport = {
  fiscalDateEnding: Date;
  reportedEPS?: number;
};

export interface FundamentalSourceInterface {
  fetchIncomeReport<O>(symbol: string, options?: O): Promise<IncomeReport[]>;
  fetchBalanceReport<O>(symbol: string, options?: O): Promise<BalanceReport[]>;
  fetchCashFlowReport<O>(symbol: string, options?: O): Promise<CashFlowReport[]>;
  fetchEarningReport<O>(symbol: string, options?: O): Promise<EarningReport[]>;
}
