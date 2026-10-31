import { CalculationResult } from '../types.js';

// Realistic base hours per size category (based on real tattoo industry data)
// Tiny (matchbook): 0.5–1.5 hr  | Small (palm): 1–3 hr  | Medium (hand): 2–5 hr
// Large (forearm panel): 4–8 hr  | X-Large (sleeve/back): 8–20 hr (multiple sessions)
const BASE_HOURS = [0.75, 1.5, 3, 5, 10];

// Complexity multipliers (kept as 1-4 internally)
// simple (1) → 0.7, moderate (2) → 1.0, detailed (3) → 1.35, intricate (4) → 1.7
const COMPLEXITY_MULTIPLIERS = [0.7, 1.0, 1.35, 1.7];
const complexityMultiplier = (c: number) => COMPLEXITY_MULTIPLIERS[Math.min(c, 4) - 1] ?? 1.0;

// Placement difficulty time multipliers
const placementMultipliers: Record<number, number> = { 0: 1.0, 1: 1.1, 2: 1.25, 3: 1.4 };

export const calculateTattooPrice = (inputs: Record<string, number>): CalculationResult => {
  const sizeCategory = Math.round(inputs.sizeCategory ?? 1); // 0=tiny, 1=small, 2=medium, 3=large, 4=x-large
  const artistLevel = Math.round(inputs.artistLevel ?? 2); // 0=apprentice, 1=junior, 2=established, 3=experienced, 4=in-demand
  const bodyPlacement = Math.round(inputs.bodyPlacement ?? 0); // 0=easy, 1=moderate, 2=difficult, 3=very difficult
  const complexity = Math.round(inputs.complexity ?? 2); // 1=simple, 2=moderate, 3=detailed, 4=intricate
  const sessionHours = inputs.sessionHours ?? 0;
  const shopMinimum = inputs.shopMinimum ?? 80;
  const tipPercent = inputs.tipPercent ?? 20;

  // Artist level hourly rates (USD, 2026 market averages)
  const artistLevelRates = [75, 125, 200, 275, 400];
  const hourlyRate = artistLevelRates[artistLevel] ?? 200;

  // Estimate hours based on size category + complexity + placement
  const baseHours = BASE_HOURS[sizeCategory] ?? 3;
  const estimatedHours = baseHours * complexityMultiplier(complexity) * (placementMultipliers[bodyPlacement] ?? 1.0);

  // Use session hours if provided, otherwise use estimate
  const actualHours = sessionHours > 0 ? sessionHours : estimatedHours;

  // Base cost
  const baseCost = actualHours * hourlyRate;

  // Shop minimum: every shop has a minimum charge to cover setup costs
  // Even the smallest tattoo must meet this minimum
  const subtotal = Math.max(baseCost, shopMinimum);

  // Tip (industry standard 15-25%)
  const tip = subtotal * (tipPercent / 100);

  const totalCost = subtotal + tip;

  // Sessions needed (realistic: max ~6 hrs per session for healing/safety)
  const sessionsNeeded = Math.ceil(actualHours / 6);

  return {
    summary: {
      totalCost: { label: 'Total Estimated Cost', value: Math.round(totalCost), type: 'currency' },
      hourlyRate: { label: 'Artist Rate', value: hourlyRate, type: 'currency' },
      estimatedHours: { label: 'Session Time', value: Math.round(actualHours * 10) / 10, type: 'number' },
      sessionsNeeded: { label: 'Sessions Required', value: sessionsNeeded, type: 'number' },
      serviceCost: { label: 'Service Cost', value: Math.round(subtotal), type: 'currency' },
      tip: { label: `Recommended Tip (${tipPercent}%)`, value: Math.round(tip), type: 'currency' },
    },
    chartData: []
  };
};