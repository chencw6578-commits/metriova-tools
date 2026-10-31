import { CalculationResult } from '../types.js';

export const calculateRoofPitch = (inputs: Record<string, number>): CalculationResult => {
  const rise = inputs.rise ?? 4;
  const run = inputs.run > 0 ? inputs.run : 12;
  const roofLength = inputs.roofLength ?? 40;
  const roofWidth = inputs.roofWidth ?? 20;

  // Pitch ratio (e.g., 4/12)
  const pitchRatio = rise / run;

  // Angle in degrees
  const angleDegrees = Math.atan(pitchRatio) * (180 / Math.PI);

  // Slope multiplier (roof surface area factor)
  const slopeMultiplier = Math.sqrt(1 + pitchRatio * pitchRatio);

  // Actual roof surface area
  const horizontalArea = roofLength * roofWidth;
  const surfaceArea = horizontalArea * slopeMultiplier;

  // Roofing squares (100 sq ft each) — US/Canada standard unit
  const roofingSquares = surfaceArea / 100;

  // Shingle bundles (typically 3 per square for standard 3-tab)
  const bundlesPerSquare = inputs.bundlesPerSquare ?? 3;
  const shingleBundles = Math.ceil(roofingSquares * bundlesPerSquare);

  // Underlayment rolls (typically 1 roll = 4 squares)
  const underlaymentRolls = Math.ceil(roofingSquares / 4);

  return {
    summary: {
      pitchRatio: { label: 'Roof Pitch Ratio (rise/run)', value: pitchRatio, type: 'number' },
      angleDegrees: { label: 'Roof Angle (degrees)', value: Math.round(angleDegrees * 10) / 10, type: 'number' },
      slopeMultiplier: { label: 'Slope Multiplier', value: Math.round(slopeMultiplier * 1000) / 1000, type: 'number' },
      surfaceArea: { label: 'Roof Surface Area (sq ft)', value: Math.round(surfaceArea * 10) / 10, type: 'number' },
      roofingSquares: { label: 'Roofing Squares (100 sq ft each)', value: Math.round(roofingSquares * 10) / 10, type: 'number' },
      shingleBundles: { label: 'Shingle Bundles Needed', value: shingleBundles, type: 'number' },
      underlaymentRolls: { label: 'Underlayment Rolls', value: underlaymentRolls, type: 'number' },
    },
    chartData: [
      { name: 'Horizontal Area', value: horizontalArea },
      { name: 'Surface Area', value: surfaceArea },
      { name: 'Waste Adjusted', value: surfaceArea * 1.1 },
    ],
  };
};