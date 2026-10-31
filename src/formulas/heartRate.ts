import { CalculationResult } from '../types.js';

export const calculateHeartRate = (inputs: Record<string, number>): CalculationResult => {
  const age = inputs.age ?? 30;
  const restingHR = inputs.restingHR ?? 65;

  const maxHR = 220 - age;
  const hrr = maxHR - restingHR;

  const fatBurnMin = restingHR + 0.50 * hrr;
  const fatBurnMax = restingHR + 0.60 * hrr;
  const fatBurnMid = (fatBurnMin + fatBurnMax) / 2;

  const aerobicMin = restingHR + 0.70 * hrr;
  const aerobicMax = restingHR + 0.80 * hrr;
  const aerobicMid = (aerobicMin + aerobicMax) / 2;

  return {
    summary: {
      maxHR: { label: 'Maximum Heart Rate (MHR)', value: maxHR, type: 'bpm' },
      fatBurnZone: { label: 'Fat Burn Zone Midpoint', value: fatBurnMid, type: 'bpm' },
      aerobicZone: { label: 'Aerobic Zone Midpoint', value: aerobicMid, type: 'bpm' },
    },
    chartData: [
      { name: 'Resting', value: restingHR },
      { name: 'Fat Burn Min (50%)', value: fatBurnMin },
      { name: 'Fat Burn Max (60%)', value: fatBurnMax },
      { name: 'Aerobic Min (70%)', value: aerobicMin },
      { name: 'Aerobic Max (80%)', value: aerobicMax },
      { name: 'Max Effort (100%)', value: maxHR },
    ]
  };
};
