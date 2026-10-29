import { CalculationResult } from '../types';

export const calculateBMR = (inputs: Record<string, number>): CalculationResult => {
  const gender = Math.round(inputs.gender ?? 0);
  const weight = inputs.weight ?? 70;
  const height = inputs.height ?? 175;
  const age = inputs.age ?? 25;

  // Mifflin-St Jeor Equation (gender-specific)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === 0 ? bmr + 5 : bmr - 161;

  const sedentary = bmr * 1.2;
  const moderate = bmr * 1.55;

  return {
    summary: {
      bmr: { label: 'Basal Metabolic Rate (BMR)', value: bmr, type: 'kcal' },
      sedentary: { label: 'Sedentary Energy Needs', value: sedentary, type: 'kcal' },
      moderate: { label: 'Active Energy Needs', value: moderate, type: 'kcal' },
    },
    chartData: [
      { name: 'BMR (At Rest)', value: bmr },
      { name: 'Sedentary (Office)', value: sedentary },
      { name: 'Light Activity', value: bmr * 1.375 },
      { name: 'Moderate Activity', value: moderate },
      { name: 'Very Active (Sports)', value: bmr * 1.725 },
      { name: 'Extreme Athlete', value: bmr * 1.9 },
    ]
  };
};
