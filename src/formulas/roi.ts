import { CalculationResult } from '../types.js';

export const calculateROI = (inputs: Record<string, number>): CalculationResult => {
  const amountInvested = inputs.amountInvested ?? 0;
  const amountReturned = inputs.amountReturned ?? 0;
  const investmentPeriod = inputs.investmentPeriod ?? 1;

  const netProfit = amountReturned - amountInvested;
  let roi = 0;
  let annualizedROI = 0;

  // annualizedROI requires a positive investment, a non-negative return and a valid period
  const validForAnnualized = amountInvested > 0 && amountReturned >= 0 && investmentPeriod > 0;

  if (validForAnnualized) {
    roi = (netProfit / amountInvested) * 100;
    annualizedROI = (Math.pow(amountReturned / amountInvested, 1 / investmentPeriod) - 1) * 100;
  } else if (amountInvested > 0) {
    roi = (netProfit / amountInvested) * 100;
  }

  return {
    summary: {
      netProfit: { label: 'Net Profit', value: netProfit, type: 'currency' },
      roi: { label: 'Return on Investment (ROI)', value: roi, type: 'percentage' },
      annualizedROI: { label: 'Annualized ROI', value: annualizedROI, type: 'percentage' },
    },
    chartData: []
  };
};
