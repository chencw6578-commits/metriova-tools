import { CalculationResult } from '../types.js';

export const calculateCalorie = (inputs: Record<string, number>): CalculationResult => {
  const weight = inputs.weight ?? 70;
  const height = inputs.height ?? 175;
  const age = inputs.age ?? 30;
  const gender = inputs.gender ?? 0; // 0 = male, 1 = female
  // Activity level is a 0-4 index into activityFactors. The field is a number
  // input, so a fractional value (e.g. 1.5) is user-reachable and used to make
  // activityFactors[1.5] undefined, producing a NaN TDEE. Clamp, then round to a
  // valid index.
  const activityLevel = Math.round(Math.min(Math.max(0, inputs.activityLevel ?? 1), 4)); // 0-4

  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === 0 ? bmr + 5 : bmr - 161;

  // Activity factors
  const activityFactors = [1.2, 1.375, 1.55, 1.725, 1.9];
  const tdee = bmr * activityFactors[activityLevel];

  // Calorie targets
  const weightLoss = tdee - 500;
  const weightGain = tdee + 500;

  return {
    summary: {
      bmr: { label: 'BMR (Resting Calories)', value: bmr, type: 'kcal' },
      tdee: { label: 'TDEE (Daily Maintenance)', value: tdee, type: 'kcal' },
      weightLoss: { label: 'Weight Loss (−0.5 kg/week)', value: weightLoss, type: 'kcal' },
      weightGain: { label: 'Weight Gain (+0.5 kg/week)', value: weightGain, type: 'kcal' },
    },
    chartData: [
      { name: 'BMR (Rest)', value: bmr },
      { name: 'Sedentary', value: bmr * 1.2 },
      { name: 'Light', value: bmr * 1.375 },
      { name: 'Moderate', value: bmr * 1.55 },
      { name: 'Very Active', value: bmr * 1.725 },
      { name: 'Extra Active', value: bmr * 1.9 },
    ],
  };
};
