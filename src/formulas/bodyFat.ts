import { CalculationResult } from '../types.js';

export const calculateBodyFat = (inputs: Record<string, number>): CalculationResult => {
  const gender = inputs.gender ?? 0; // 0 = male, 1 = female (consistent with all other health calculators)
  const height = inputs.height ?? 175; // cm
  const neck = inputs.neck ?? 38; // cm
  const abdomen = inputs.abdomen ?? 85; // cm (waist for male)
  const waist = inputs.waist ?? 75; // cm (waist for female)
  const hip = inputs.hip ?? 95; // cm (only for female)

  // US Navy Body Fat Formula (Hodgdon & Beckett, 1984)
  // This is one of the most widely used circumference-based body fat estimation methods
  let bodyFatPercent = 0;
  if (gender === 0) {
    // Male: BF% = 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
    const waistNeckDiff = Math.max(1, abdomen - neck);
    bodyFatPercent = 495 / (1.0324 - 0.19077 * Math.log10(waistNeckDiff) + 0.15456 * Math.log10(height)) - 450;
  } else {
    // Female: BF% = 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
    const waistHipNeckSum = Math.max(1, waist + hip - neck);
    bodyFatPercent = 495 / (1.29579 - 0.35004 * Math.log10(waistHipNeckSum) + 0.22100 * Math.log10(height)) - 450;
  }

  bodyFatPercent = Math.max(2, Math.min(60, bodyFatPercent));

  // Determine category
  let idealMin = 0;
  if (gender === 0) {
    if (bodyFatPercent < 6) { idealMin = 2; }
    else if (bodyFatPercent < 14) { idealMin = 6; }
    else if (bodyFatPercent < 18) { idealMin = 14; }
    else if (bodyFatPercent < 25) { idealMin = 18; }
    else { idealMin = 25; }
  } else {
    if (bodyFatPercent < 14) { idealMin = 10; }
    else if (bodyFatPercent < 21) { idealMin = 14; }
    else if (bodyFatPercent < 25) { idealMin = 21; }
    else if (bodyFatPercent < 32) { idealMin = 25; }
    else { idealMin = 32; }
  }

  // Fat mass and lean mass
  const weight = inputs.weight ?? 70;
  const fatMass = weight * (bodyFatPercent / 100);
  const leanMass = weight - fatMass;

  return {
    summary: {
      bodyFat: { label: 'Body Fat Percentage', value: Math.round(bodyFatPercent * 10) / 10, type: 'percentage' },
      fatMass: { label: 'Fat Mass', value: Math.round(fatMass * 10) / 10, type: 'kg' },
      leanMass: { label: 'Lean Body Mass', value: Math.round(leanMass * 10) / 10, type: 'kg' },
    },
    chartData: [
      { name: 'Essential', value: idealMin },
      { name: 'Athletic', value: gender === 0 ? 13 : 20 },
      { name: 'Fitness', value: gender === 0 ? 17 : 24 },
      { name: 'Average', value: gender === 0 ? 24 : 31 },
      { name: 'Your Body Fat', value: bodyFatPercent },
    ],
  };
};