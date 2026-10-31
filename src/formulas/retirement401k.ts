import { CalculationResult } from '../types.js';

export const calculate401k = (inputs: Record<string, number>): CalculationResult => {
  const currentAge = inputs.currentAge ?? 30;
  const retirementAge = inputs.retirementAge ?? 65;
  const currentBalance = inputs.currentBalance ?? 0;
  const annualContribution = inputs.annualContribution ?? 10000;
  const employerMatchPercent = inputs.employerMatchPercent ?? 0; // e.g. 50 = match 50% of contributions
  const annualReturn = inputs.annualReturn ?? 7; // % per year

  const years = Math.max(1, retirementAge - currentAge);
  const annualRate = annualReturn / 100;
  const annualMatch = (annualContribution * employerMatchPercent) / 100;
  const totalAnnualSavings = annualContribution + annualMatch;

  // Year-by-year compounding with annual contributions (end of year)
  let balance = currentBalance;
  const chartData = [];
  let totalContributions = currentBalance;
  let totalMatch = 0;

  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + annualRate) + totalAnnualSavings;
    totalContributions += annualContribution;
    totalMatch += annualMatch;
    if (y % 5 === 0 || y === years) {
      chartData.push({
        name: String(currentAge + y),
        value: Math.round(balance),
      });
    }
  }

  const totalInterest = Math.max(0, balance - totalContributions - totalMatch);

  return {
    summary: {
      balance: { label: `Balance at Age ${retirementAge}`, value: Math.round(balance), type: 'currency' },
      totalContributions: { label: 'Your Contributions', value: Math.round(totalContributions), type: 'currency' },
      employerMatch: { label: 'Employer Match', value: Math.round(totalMatch), type: 'currency' },
      investmentGains: { label: 'Investment Gains', value: Math.round(totalInterest), type: 'currency' },
    },
    chartData,
  };
};
