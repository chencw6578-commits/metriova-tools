import { CalculationResult } from '../types.js';

export const calculateSIP = (inputs: Record<string, number>): CalculationResult => {
  const monthlyInvestment = inputs.monthlyInvestment ?? 0;
  const expectedReturn = inputs.expectedReturn ?? 12;
  const timePeriod = inputs.timePeriod ?? 15;

  const i = expectedReturn / 12 / 100;
  let balance = 0;
  let investedAmount = 0;
  const chartData = [];

  chartData.push({
    year: 0,
    balance: 0,
    contributions: 0,
    interest: 0
  });

  for (let year = 1; year <= timePeriod; year++) {
    for (let month = 1; month <= 12; month++) {
      balance = (balance + monthlyInvestment) * (1 + i);
      investedAmount += monthlyInvestment;
    }

    chartData.push({
      year,
      balance: Math.round(balance),
      contributions: Math.round(investedAmount),
      interest: Math.round(Math.max(0, balance - investedAmount))
    });
  }

  const estimatedReturns = Math.max(0, balance - investedAmount);

  return {
    summary: {
      totalValue: { label: 'Total Value', value: balance, type: 'currency' },
      investedAmount: { label: 'Total Invested', value: investedAmount, type: 'currency' },
      estimatedReturns: { label: 'Estimated Returns', value: estimatedReturns, type: 'currency' }
    },
    chartData
  };
};
