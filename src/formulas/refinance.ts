import { CalculationResult } from '../types';

export const calculateRefinance = (inputs: Record<string, number>): CalculationResult => {
  const currentBalance = inputs.currentBalance ?? 250000;
  const currentRate = inputs.currentRate ?? 7.0;
  const newRate = inputs.newRate ?? 5.5;
  const remainingYears = inputs.remainingYears ?? 25;
  const newLoanTermYears = inputs.newLoanTermYears ?? 30;
  const closingCosts = inputs.closingCosts ?? 5000;

  function monthlyPayment(principal: number, annualRate: number, years: number): number {
    const n = years * 12;
    // Guard against zero/negative term (division by zero)
    if (n <= 0) return 0;
    const r = annualRate / 100 / 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const oldPayment = monthlyPayment(currentBalance, currentRate, remainingYears);
  const newPayment = monthlyPayment(currentBalance, newRate, newLoanTermYears);
  const monthlySavings = oldPayment - newPayment;

  // Total interest comparison (paid over remaining term)
  const oldTotalInterest = oldPayment * remainingYears * 12 - currentBalance;
  const newTotalInterest = newPayment * newLoanTermYears * 12 - currentBalance;
  const interestSaved = Math.max(0, oldTotalInterest - newTotalInterest);

  // Break-even: months to recover closing costs
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;

  // Chart: cumulative savings over 10 years
  const chartData = [];
  for (let year = 1; year <= 10; year++) {
    const cumulativeSavings = monthlySavings * 12 * year - closingCosts;
    chartData.push({
      name: String(year),
      value: Math.round(cumulativeSavings),
    });
  }

  return {
    summary: {
      oldPayment: { label: 'Current Monthly Payment', value: Math.round(oldPayment), type: 'currency' },
      newPayment: { label: 'New Monthly Payment', value: Math.round(newPayment), type: 'currency' },
      monthlySavings: { label: 'Monthly Savings', value: Math.round(monthlySavings), type: 'currency' },
      // Fixed: replaced sentinel -1 with clear message string
      breakEvenMonths: { label: 'Break-Even (months)', value: breakEvenMonths === Infinity ? 'No break-even — no monthly savings' : breakEvenMonths, type: breakEvenMonths === Infinity ? 'string' : 'number' },
      interestSaved: { label: 'Total Interest Saved', value: Math.round(interestSaved), type: 'currency' },
    },
    chartData,
  };
};