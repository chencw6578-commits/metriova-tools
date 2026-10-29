import { CalculationResult } from '../types';

export const calculateNetWorth = (inputs: Record<string, number>): CalculationResult => {
  const cashAssets = inputs.cashAssets ?? 0;
  const investments = inputs.investments ?? 0;
  const realEstate = inputs.realEstate ?? 0;
  const otherAssets = inputs.otherAssets ?? 0;
  const mortgage = inputs.mortgage ?? 0;
  const loans = inputs.loans ?? 0;
  const creditCardDebt = inputs.creditCardDebt ?? 0;
  const otherLiabilities = inputs.otherLiabilities ?? 0;

  const totalAssets = cashAssets + investments + realEstate + otherAssets;
  const totalLiabilities = mortgage + loans + creditCardDebt + otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;

  return {
    summary: {
      netWorth: { label: 'Net Worth', value: netWorth, type: 'currency' },
      totalAssets: { label: 'Total Assets', value: totalAssets, type: 'currency' },
      totalLiabilities: { label: 'Total Liabilities', value: totalLiabilities, type: 'currency' },
    },
    chartData: [
      { name: 'Cash & Bank', value: cashAssets },
      { name: 'Investments', value: investments },
      { name: 'Real Estate', value: realEstate },
      { name: 'Other Assets', value: otherAssets },
      { name: 'Mortgage', value: mortgage },
      { name: 'Loans', value: loans },
      { name: 'Credit Card Debt', value: creditCardDebt },
      { name: 'Other Liabilities', value: otherLiabilities },
    ],
  };
};
