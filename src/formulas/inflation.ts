import { CalculationResult } from '../types';

export const calculateInflation = (inputs: Record<string, number>): CalculationResult => {
  const initialAmount = inputs.initialAmount ?? 0;
  const inflationRate = inputs.inflationRate ?? 0;
  const years = inputs.years ?? 10;

  const r = inflationRate / 100;
  const chartData = [];

  chartData.push({
    name: '0',
    value: Math.round(initialAmount), // Current Purchasing Power
    cost: Math.round(initialAmount), // Equivalent Cost
    loss: 0
  });

  for (let year = 1; year <= years; year++) {
    const cost = initialAmount * Math.pow(1 + r, year);
    const power = initialAmount / Math.pow(1 + r, year);
    const loss = initialAmount - power;

    chartData.push({
      name: String(year),
      value: Math.round(power),
      cost: Math.round(cost),
      loss: Math.round(loss)
    });
  }

  const futurePurchasingPower = initialAmount / Math.pow(1 + r, years);
  const equivalentCost = initialAmount * Math.pow(1 + r, years);
  const totalLoss = initialAmount - futurePurchasingPower;

  return {
    summary: {
      futurePurchasingPower: { label: 'Future Purchasing Power', value: futurePurchasingPower, type: 'currency' },
      equivalentCost: { label: 'Equivalent Price in Future', value: equivalentCost, type: 'currency' },
      totalLoss: { label: 'Purchasing Power Lost', value: totalLoss, type: 'currency' }
    },
    chartData
  };
};
