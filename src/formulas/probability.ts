import { CalculationResult } from '../types';

export const calculateProbability = (inputs: Record<string, number>): CalculationResult => {
  const favorable = Math.max(0, inputs.favorable ?? 1);
  const total = inputs.total ?? 2;
  const trials = Math.max(0, inputs.trials ?? 1);

  // Empty/zero total is not a valid sample space
  if (total <= 0 || favorable > total) {
    return {
      summary: {
        probability: { label: 'Probability', value: 0, type: 'percentage' },
        complementProbability: { label: 'Complement Probability (Not Occurring)', value: 0, type: 'percentage' },
        expectedValue: { label: 'Expected Occurrences (in N trials)', value: 0, type: 'number' },
        atLeastOneProb: { label: 'Chance of at least one occurrence in N trials', value: 0, type: 'percentage' },
      },
      chartData: [
        { name: 'Favorable Outcomes', value: favorable },
        { name: 'Unfavorable Outcomes', value: Math.max(0, total - favorable) },
      ],
    };
  }

  const probability = (favorable / total) * 100;
  const complementProbability = 100 - probability;
  const expectedValue = (probability / 100) * trials;
  const atLeastOneProb = trials === 0 ? 0 : (1 - Math.pow(1 - probability / 100, trials)) * 100;

  return {
    summary: {
      probability: { label: 'Probability', value: probability, type: 'percentage' },
      complementProbability: { label: 'Complement Probability (Not Occurring)', value: complementProbability, type: 'percentage' },
      expectedValue: { label: 'Expected Occurrences (in N trials)', value: expectedValue, type: 'number' },
      atLeastOneProb: { label: 'Chance of at least one occurrence in N trials', value: atLeastOneProb, type: 'percentage' },
    },
    chartData: [
      { name: 'Favorable Outcomes', value: favorable },
      { name: 'Unfavorable Outcomes', value: Math.max(0, total - favorable) },
    ],
  };
};