import { CalculationResult } from '../types.js';

export const calculatePercentage = (inputs: Record<string, number>): CalculationResult => {
  const mode = inputs.mode ?? 0;
  const value1 = inputs.value1 ?? 0;
  const value2 = inputs.value2 ?? 0;

  let percentage = 0;
  let result = 0;

  if (mode === 0) {
    // What is X% of Y?
    percentage = value1;
    result = (value1 / 100) * value2;
  } else if (mode === 1) {
    // X is what % of Y?
    if (value2 !== 0) {
      percentage = (value1 / value2) * 100;
    }
    result = percentage;
  } else if (mode === 2) {
    // Percentage increase/decrease from X to Y
    if (value1 !== 0) {
      percentage = ((value2 - value1) / value1) * 100;
    }
    result = percentage;
  }

  return {
    summary: {
      result: { label: mode === 0 ? `Result: ${value1}% of ${value2}` : mode === 1 ? `${value1} is what % of ${value2}` : `${value1} to ${value2} change`, value: result, type: 'number' },
      percentage: { label: 'Percentage', value: percentage, type: 'percentage' },
    },
  };
};