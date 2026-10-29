import { CalculationResult } from '../types';

export const calculateWaterIntake = (inputs: Record<string, number>): CalculationResult => {
  const weight = inputs.weight ?? 70;
  const exerciseTime = inputs.exerciseTime ?? 45;
  const hotClimate = inputs.hotClimate ?? 0;

  // 35ml per kg of body weight
  const baselineWater = weight * 35;
  
  // 350ml extra for every 30 minutes of exercise
  const exerciseBonus = (exerciseTime / 30) * 350;

  // 500ml extra for hot/dry climate
  const climateBonus = hotClimate === 1 ? 500 : 0;

  const totalGoal = baselineWater + exerciseBonus + climateBonus;

  return {
    summary: {
      waterGoal: { label: 'Daily Hydration Goal', value: totalGoal, type: 'ml' },
      baselineWater: { label: 'Baseline Water Needs', value: baselineWater, type: 'ml' },
      exerciseBonus: { label: 'Exercise Hydration Bonus', value: exerciseBonus, type: 'ml' },
      climateBonus: { label: 'Climate Hydration Bonus', value: climateBonus, type: 'ml' },
    },
    chartData: [
      { name: 'Baseline Need', value: baselineWater },
      { name: 'Exercise Bonus', value: exerciseBonus },
      { name: 'Climate Bonus', value: climateBonus },
      { name: 'Total Target', value: totalGoal },
    ]
  };
};
