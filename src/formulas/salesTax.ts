import { CalculationResult } from '../types';

export const calculateSalesTax = (inputs: Record<string, number>): CalculationResult => {
  const amount = inputs.amount ?? 0;
  const taxRate = inputs.taxRate ?? 0;
  const tipPercent = inputs.tipPercent ?? 0;

  const taxAmount = amount * (taxRate / 100);
  const tipAmount = amount * (tipPercent / 100);
  const totalAmount = amount + taxAmount + tipAmount;

  return {
    summary: {
      totalAmount: { label: 'Total Amount (Incl. Tax)', value: totalAmount, type: 'currency' },
      taxAmount: { label: 'Sales Tax Amount', value: taxAmount, type: 'currency' },
      tipAmount: { label: 'Tip Amount', value: tipAmount, type: 'currency' },
    },
    chartData: []
  };
};
