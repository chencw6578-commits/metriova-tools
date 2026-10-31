import { CalculationResult } from '../types.js';

export const calculateTip = (inputs: Record<string, number>): CalculationResult => {
  const billAmount = inputs.billAmount ?? 50;
  const tipPercentage = inputs.tipPercentage ?? 15;
  const numPeople = inputs.numPeople ?? 1;

  const tipAmount = billAmount * (tipPercentage / 100);
  const totalAmount = billAmount + tipAmount;
  const perPerson = totalAmount / Math.max(1, numPeople);
  const tipPerPerson = tipAmount / Math.max(1, numPeople);

  return {
    summary: {
      tipAmount: { label: `Tip Amount (${tipPercentage}%)`, value: tipAmount, type: 'currency' },
      totalAmount: { label: 'Total Bill (incl. Tip)', value: totalAmount, type: 'currency' },
      perPerson: { label: 'Total Per Person', value: perPerson, type: 'currency' },
      tipPerPerson: { label: 'Tip Per Person', value: tipPerPerson, type: 'currency' },
    },
    chartData: []
  };
};