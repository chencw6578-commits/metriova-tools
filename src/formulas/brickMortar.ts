import { CalculationResult } from '../types';

export const calculateBrickMortar = (inputs: Record<string, number>): CalculationResult => {
  const wallLength = inputs.wallLength ?? 5;
  const wallHeight = inputs.wallHeight ?? 3;
  const brickLength = inputs.brickLength ?? 240; // in mm
  const brickWidth = inputs.brickWidth ?? 115; // in mm
  const brickHeight = inputs.brickHeight ?? 53; // in mm
  const mortarJoint = inputs.mortarJoint ?? 10; // in mm
  const wastage = inputs.wastage !== undefined ? inputs.wastage : 5;

  // Convert dimensions to meters
  const bL = brickLength / 1000;
  const bW = brickWidth / 1000;
  const bH = brickHeight / 1000;
  const mJ = mortarJoint / 1000;

  const wallArea = wallLength * wallHeight; // in m²
  const wallVolume = wallArea * bW; // in m³, assuming single-skin wall (thickness = brick width)

  // Brick face area with mortar joint around it
  const effectiveLength = bL + mJ;
  const effectiveHeight = bH + mJ;
  const effectiveBrickArea = effectiveLength * effectiveHeight;

  const rawBrickCount = effectiveBrickArea > 0 ? wallArea / effectiveBrickArea : 0;
  const wastageBricks = rawBrickCount * (wastage / 100);
  const totalBricksNeeded = Math.ceil(rawBrickCount + wastageBricks);

  // Pure volume of bricks (without joint)
  const singleBrickVolume = bL * bW * bH;
  const pureBricksVolume = rawBrickCount * singleBrickVolume;

  // Mortar volume is the wall volume minus pure brick volume
  const wetMortarVolume = Math.max(0, wallVolume - pureBricksVolume);
  const totalWetMortarVolume = wetMortarVolume * (1 + wastage / 100);

  // Dry mortar mix is approx 1.25 times the wet volume due to compaction and water evaporation
  const dryMortarVolume = totalWetMortarVolume * 1.25;

  // Standard mortar ratio: 1 Part Cement, 4 Parts Sand (by volume)
  const totalParts = 1 + 4;
  const cementVol = dryMortarVolume * (1 / totalParts);
  const sandVol = dryMortarVolume * (4 / totalParts);

  // Cement properties: Density ~1440 kg/m³, 50kg bag
  const cementWeightKg = cementVol * 1440;
  const cementBags = Math.ceil(cementWeightKg / 50);

  // Sand properties: Density ~1600 kg/m³
  const sandWeightKg = sandVol * 1600;

  return {
    summary: {
      wallArea: { label: 'Wall Face Area', value: wallArea, type: 'sq_meters' },
      bricksCount: { label: 'Total Bricks Needed', value: totalBricksNeeded, type: 'pieces' },
      mortarVolume: { label: 'Wet Mortar Needed', value: totalWetMortarVolume, type: 'cubic_meters' },
      cementBags: { label: 'Mortar Cement (50kg Bags)', value: cementBags, type: 'bags' },
      sandWeight: { label: 'Mortar Sand Needed', value: Math.round(sandWeightKg), type: 'kg' },
    },
    chartData: [
      { name: 'Bricks Volume', value: Math.round(pureBricksVolume * 1000) / 1000 },
      { name: 'Mortar Volume', value: Math.round(totalWetMortarVolume * 1000) / 1000 },
    ],
  };
};
