import { CalculationResult } from '../types.js';

export const calculatePregnancyWeightGain = (inputs: Record<string, number>): CalculationResult => {
  const preWeight = inputs.preWeight ?? 65; // kg
  const height = inputs.height ?? 165; // cm
  const currentWeight = inputs.currentWeight ?? preWeight;
  const trimester = Math.min(3, Math.max(1, Math.round(inputs.trimester ?? 2)));

  const heightInMeters = height / 100;
  const bmi = preWeight / (heightInMeters * heightInMeters);

  // IOM Guidelines for singleton pregnancy (2009, reaffirmed 2020)
  // These guidelines vary by pre-pregnancy BMI category
  let recommendedMin = 0;
  let recommendedMax = 0;
  let bmiCategory = '';

  if (bmi < 18.5) {
    recommendedMin = 12.5;
    recommendedMax = 18.0;
    bmiCategory = 'Underweight (BMI < 18.5)';
  } else if (bmi < 25) {
    recommendedMin = 11.5;
    recommendedMax = 16.0;
    bmiCategory = 'Normal weight (BMI 18.5–24.9)';
  } else if (bmi < 30) {
    recommendedMin = 7.0;
    recommendedMax = 11.5;
    bmiCategory = 'Overweight (BMI 25–29.9)';
  } else {
    recommendedMin = 5.0;
    recommendedMax = 9.0;
    bmiCategory = 'Obese (BMI ≥ 30)';
  }

  // Trimester weight gain based on BMI category (IOM recommendations):
  // first trimester 0.5–2 kg TOTAL for all categories; the 2nd/3rd trimester
  // use weekly rates by BMI (kg/week): underweight 0.44–0.58, normal
  // 0.35–0.50, overweight 0.23–0.37, obese 0.17–0.27. Trimester expectations
  // below = weekly rate × weeks in the trimester (T2 ≈ 13 weeks, T3 ≈ 14
  // weeks), rounded to 0.1 kg. The trimester input now selects which of these
  // ranges is reported — previously the input was collected as required but
  // never read by the formula.
  let weeklyMin = 0.35;
  let weeklyMax = 0.50;

  if (bmi < 18.5) {
    weeklyMin = 0.44;
    weeklyMax = 0.58;
  } else if (bmi < 25) {
    weeklyMin = 0.35;
    weeklyMax = 0.50;
  } else if (bmi < 30) {
    weeklyMin = 0.23;
    weeklyMax = 0.37;
  } else {
    weeklyMin = 0.17;
    weeklyMax = 0.27;
  }

  const round1 = (x: number) => Math.round(x * 10) / 10;
  const t1Range: [number, number] = [0.5, 2.0];
  const t2Range: [number, number] = [round1(weeklyMin * 13), round1(weeklyMax * 13)];
  const t3Range: [number, number] = [round1(weeklyMin * 14), round1(weeklyMax * 14)];
  const trimesterRanges: Record<number, [number, number]> = { 1: t1Range, 2: t2Range, 3: t3Range };
  const [triMin, triMax] = trimesterRanges[trimester];

  const currentGain = currentWeight - preWeight;
  const remainingGain = Math.max(0, recommendedMax - currentGain);

  return {
    summary: {
      currentGain: { label: 'Current Weight Gain', value: Math.round(currentGain * 10) / 10, type: 'kg' },
      recommendedMin: { label: `Recommended Min Gain (${bmiCategory})`, value: recommendedMin, type: 'kg' },
      recommendedMax: { label: `Recommended Max Gain (${bmiCategory})`, value: recommendedMax, type: 'kg' },
      remainingGain: { label: 'Remaining Recommended', value: Math.round(remainingGain * 10) / 10, type: 'kg' },
      trimesterMin: { label: `Recommended Gain — Trimester ${trimester} Min (${bmiCategory})`, value: triMin, type: 'kg' },
      trimesterMax: { label: `Recommended Gain — Trimester ${trimester} Max (${bmiCategory})`, value: triMax, type: 'kg' },
    },
    chartData: [
      { name: 'First Trimester', value: (t1Range[0] + t1Range[1]) / 2 },
      { name: 'Second Trimester', value: (t2Range[0] + t2Range[1]) / 2 },
      { name: 'Third Trimester', value: (t3Range[0] + t3Range[1]) / 2 },
      { name: 'Your Gain So Far', value: Math.max(0, currentGain) },
    ],
  };
};
