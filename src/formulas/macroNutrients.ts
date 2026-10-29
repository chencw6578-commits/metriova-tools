import { CalculationResult } from '../types';

export const calculateMacroNutrients = (inputs: Record<string, number>): CalculationResult => {
  const dailyCalories = inputs.dailyCalories ?? 2000;
  const proteinRatio = inputs.proteinRatio ?? 30;
  const carbRatio = inputs.carbRatio ?? 40;
  const fatRatio = inputs.fatRatio ?? 30;

  // Safe-normalize ratios to sum to exactly 100%
  const totalRatio = proteinRatio + carbRatio + fatRatio;
  const scale = totalRatio > 0 ? 100 / totalRatio : 1;
  const pPercent = proteinRatio * scale;
  const cPercent = carbRatio * scale;
  const fPercent = fatRatio * scale;

  // Calculate grams: protein (4 kcal/g), carbs (4 kcal/g), fats (9 kcal/g)
  const proteinGrams = (dailyCalories * (pPercent / 100)) / 4;
  const carbGrams = (dailyCalories * (cPercent / 100)) / 4;
  const fatGrams = (dailyCalories * (fPercent / 100)) / 9;

  return {
    summary: {
      proteinGrams: { label: 'Protein Target', value: proteinGrams, type: 'grams' },
      carbGrams: { label: 'Carbohydrates Target', value: carbGrams, type: 'grams' },
      fatGrams: { label: 'Healthy Fats Target', value: fatGrams, type: 'grams' },
    },
    chartData: [
      { name: 'Protein (g)', value: proteinGrams },
      { name: 'Carbs (g)', value: carbGrams },
      { name: 'Fats (g)', value: fatGrams },
    ]
  };
};
