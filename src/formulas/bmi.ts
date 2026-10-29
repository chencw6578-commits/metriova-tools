import { CalculationResult } from '../types';

export const calculateBMI = (inputs: Record<string, number>): CalculationResult => {
  const weight = inputs.weight ?? 70;
  const height = inputs.height ?? 175;

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // Guard against division by zero (height = 0) or invalid inputs
  const safeBmi = isFinite(bmi) ? bmi : 0;

  const healthyMin = 18.5 * (heightInMeters * heightInMeters);
  const healthyMax = 24.9 * (heightInMeters * heightInMeters);

  // Only show BMI and healthy weight range — removed gender-specific ideal weights
  // as BMI calculator does not collect gender input, avoiding user confusion

  return {
    summary: {
      bmi: { label: 'Body Mass Index (BMI)', value: Math.round(safeBmi * 10) / 10, type: 'number' },
      healthyMin: { label: 'Healthy Weight Minimum (kg)', value: Math.round(healthyMin * 10) / 10, type: 'kg' },
      healthyMax: { label: 'Healthy Weight Maximum (kg)', value: Math.round(healthyMax * 10) / 10, type: 'kg' },
    },
    chartData: [
      { name: 'Your BMI', value: Math.round(safeBmi * 10) / 10 },
    ],
  };
};