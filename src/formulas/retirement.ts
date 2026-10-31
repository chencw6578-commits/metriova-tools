import { CalculationResult } from '../types.js';

export const calculateRetirement = (inputs: Record<string, number>): CalculationResult => {
  const currentAge = inputs.currentAge ?? 30;
  const retirementAge = inputs.retirementAge ?? 65;
  const currentSavings = inputs.currentSavings ?? 0;
  const monthlyContribution = inputs.monthlyContribution ?? 0;
  const annualReturn = inputs.annualReturn ?? 7;
  const inflationRate = inputs.inflationRate ?? 2.5;

  const yearsToRetire = Math.max(1, retirementAge - currentAge);
  const rNominal = annualReturn / 100 / 12;
  const rInflation = inflationRate / 100;

  let nominalBalance = currentSavings;
  let totalContributions = currentSavings;

  const chartData = [];
  chartData.push({
    year: 0,
    age: currentAge,
    balance: nominalBalance,
    realBalance: nominalBalance,
    contributions: totalContributions
  });

  for (let year = 1; year <= yearsToRetire; year++) {
    for (let month = 1; month <= 12; month++) {
      nominalBalance = nominalBalance * (1 + rNominal) + monthlyContribution;
      totalContributions += monthlyContribution;
    }

    // Discount nominal balance by cumulative inflation to find purchasing power
    const realBalance = nominalBalance / Math.pow(1 + rInflation, year);

    chartData.push({
      year,
      age: currentAge + year,
      balance: Math.round(nominalBalance),
      realBalance: Math.round(realBalance),
      contributions: Math.round(totalContributions)
    });
  }

  const finalBalance = nominalBalance;
  const inflationAdjusted = finalBalance / Math.pow(1 + rInflation, yearsToRetire);
  const totalEarnings = finalBalance - totalContributions;

  return {
    summary: {
      retirementNestEgg: { label: 'Retirement Nest Egg (Nominal)', value: finalBalance, type: 'currency' },
      inflationAdjusted: { label: 'Purchasing Power (Real Value)', value: inflationAdjusted, type: 'currency' },
      totalContributions: { label: 'Total Contributions', value: totalContributions, type: 'currency' },
      totalEarnings: { label: 'Total Investment Earnings', value: totalEarnings, type: 'currency' },
    },
    chartData: chartData.map(d => ({
      name: String(d.age), // Use age as X-Axis label
      value: d.balance,
      realValue: d.realBalance,
      contributions: d.contributions
    }))
  };
};
