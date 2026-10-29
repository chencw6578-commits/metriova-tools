import { CalculationResult } from '../types';

export const calculateBreakEven = (inputs: Record<string, number>): CalculationResult => {
  const fixedCosts = inputs.fixedCosts ?? 0;
  const pricePerUnit = inputs.pricePerUnit ?? 0;
  const variableCostPerUnit = inputs.variableCostPerUnit ?? 0;

  const contributionMargin = pricePerUnit - variableCostPerUnit;
  // When the unit price doesn't exceed variable cost, no break-even exists.
  // Return a clear message instead of a misleading 0 units.
  const canBreakEven = contributionMargin > 0;
  const breakEvenUnits = canBreakEven ? fixedCosts / contributionMargin : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  const contributionMarginRatio = pricePerUnit > 0 ? (contributionMargin / pricePerUnit) * 100 : 0;

  // Generate chart data showing profit/loss at different sales volumes
  const chartData = [];
  const maxUnits = Math.max(Math.ceil(breakEvenUnits * 2), 100);
  const stepSize = Math.max(1, Math.ceil(maxUnits / 10));

  for (let units = 0; units <= maxUnits; units += stepSize) {
    const revenue = units * pricePerUnit;
    const totalCosts = fixedCosts + units * variableCostPerUnit;
    const profit = revenue - totalCosts;
    chartData.push({
      units,
      revenue,
      costs: totalCosts,
      profit,
    });
  }

  return {
    summary: {
      breakEvenUnits: canBreakEven
        ? { label: 'Break-Even Point (Units)', value: breakEvenUnits, type: 'number' }
        : { label: 'Break-Even Point (Units)', value: 'No break-even — unit price ≤ variable cost per unit', type: 'string' },
      breakEvenRevenue: canBreakEven
        ? { label: 'Break-Even Revenue', value: breakEvenRevenue, type: 'currency' }
        : { label: 'Break-Even Revenue', value: 0, type: 'currency' },
      contributionMargin: { label: 'Contribution Margin per Unit', value: contributionMargin, type: 'currency' },
      contributionMarginRatio: { label: 'Contribution Margin Ratio', value: contributionMarginRatio, type: 'percentage' },
    },
    chartData,
  };
};
