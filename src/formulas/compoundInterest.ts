import { CalculationResult } from '../types.js';

export const calculateCompoundInterest = (inputs: Record<string, number>): CalculationResult => {
  const initialBalance = inputs.initialBalance ?? 0;
  const interestRate = inputs.interestRate ?? 0;
  const years = inputs.years ?? 0;
  const monthlyContribution = inputs.monthlyContribution ?? 0;

  const r = interestRate / 100;
  const n = 12; // compounding monthly

  let finalBalance = initialBalance;
  let totalContributions = initialBalance;
  
  const chartData = [];
  
  chartData.push({
    year: 0,
    balance: initialBalance,
    contributions: totalContributions,
    interest: 0
  });

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      finalBalance = finalBalance * (1 + r / n) + monthlyContribution;
      totalContributions += monthlyContribution;
    }
    
    chartData.push({
      year,
      balance: finalBalance,
      contributions: totalContributions,
      interest: finalBalance - totalContributions
    });
  }

  const totalInterest = finalBalance - totalContributions;

  return {
    summary: {
      finalBalance: { label: 'Final Balance', value: finalBalance, type: 'currency' },
      totalContributions: { label: 'Total Contributions', value: totalContributions, type: 'currency' },
      totalInterest: { label: 'Total Interest Earned', value: totalInterest, type: 'currency' },
    },
    chartData
  };
};
