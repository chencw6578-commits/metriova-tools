import { CalculationResult } from '../types';

export const calculateIdealWeight = (inputs: Record<string, number>): CalculationResult => {
  const gender = Math.round(inputs.gender ?? 0); // 0=Male, 1=Female
  const height = inputs.height ?? 170; // cm
  const totalInches = height / 2.54;
  const inchesOver5ft = Math.max(0, totalInches - 60);
  const heightInMeters = height / 100;

  // Devine formula (1974) — most widely used clinically
  const devine = gender === 0
    ? 50 + 2.3 * inchesOver5ft
    : 45.5 + 2.3 * inchesOver5ft;

  // Healthy BMI range (WHO standard: 18.5–24.9)
  const healthyMin = Math.round(18.5 * heightInMeters * heightInMeters * 10) / 10;
  const healthyMax = Math.round(24.9 * heightInMeters * heightInMeters * 10) / 10;

  return {
    summary: {
      recommended: {
        label: 'Your Ideal Weight',
        value: Math.round(devine * 10) / 10,
        type: 'kg',
      },
      healthyRange: {
        label: 'Healthy Weight Range (BMI 18.5–24.9)',
        value: `${healthyMin} kg – ${healthyMax} kg`,
        type: 'string',
      },
    },
  };
};