import { CalculationResult } from '../types.js';

export const calculateRoofing = (inputs: Record<string, number>): CalculationResult => {
  const length = inputs.roofLength ?? 10; // meters
  const width = inputs.roofWidth ?? 8; // meters
  const pitch = inputs.roofPitch ?? 4; // rise per 12 inches run
  const wastePercent = inputs.wastePercent ?? 10;
  const bundlesPerSquare = inputs.bundlesPerSquare ?? 3; // typical: 3 bundles per 100 sq ft (1 square)

  // Calculate roof area with pitch adjustment
  // pitch factor = sqrt(1 + (pitch/12)^2)
  const pitchFactor = Math.sqrt(1 + Math.pow(pitch / 12, 2));
  const roofAreaSqm = length * width * pitchFactor;

  // Convert to squares (1 square = 100 sq ft = 9.2903 sq m)
  const squares = roofAreaSqm / 9.2903;
  const squaresWithWaste = squares * (1 + wastePercent / 100);
  const totalBundles = Math.ceil(squaresWithWaste * bundlesPerSquare);

  // Underlayment (1 roll covers ~4 squares)
  const underlaymentRolls = Math.ceil(squaresWithWaste / 4);

  return {
    summary: {
      totalBundles: { label: 'Shingle Bundles Needed', value: totalBundles, type: 'bags' },
      roofArea: { label: 'Roof Surface Area (sq m)', value: Math.round(roofAreaSqm * 10) / 10, type: 'sq_meters' },
      squares: { label: 'Roofing Squares (100 sq ft each)', value: Math.round(squaresWithWaste * 10) / 10, type: 'number' },
      underlaymentRolls: { label: 'Underlayment Rolls', value: underlaymentRolls, type: 'boxes' },
    },
    chartData: [
      { name: 'Base Area', value: length * width },
      { name: 'Pitch Adjustment', value: roofAreaSqm - length * width },
      { name: 'Waste Margin', value: roofAreaSqm * (wastePercent / 100) },
    ],
  };
};