import { CalculationResult } from '../types';

export const calculateWallPaint = (inputs: Record<string, number>): CalculationResult => {
  const length = inputs.length ?? 6;
  const width = inputs.width ?? 4;
  const height = inputs.wallHeight !== undefined ? inputs.wallHeight : (inputs.height ?? 2.8);
  const coats = inputs.coats ?? 2;
  const excludeArea = inputs.excludeArea ?? 0;
  const coverage = inputs.coverage > 0 ? inputs.coverage : 10;

  const perimeter = 2 * (length + width);
  const rawWallArea = perimeter * height;
  const paintArea = Math.max(0, rawWallArea - excludeArea);
  const totalCoverageArea = paintArea * coats;
  const paintVolume = totalCoverageArea / coverage;

  return {
    summary: {
      perimeter: { label: 'Room Perimeter', value: perimeter, type: 'number' },
      totalArea: { label: 'Wall Surface Area', value: rawWallArea, type: 'sq_meters' },
      netArea: { label: 'Net Painted Area', value: paintArea, type: 'sq_meters' },
      paintVolume: { label: 'Total Paint Needed', value: paintVolume, type: 'liters' },
    },
    chartData: [
      { name: 'Net Painted Area', value: Math.round(paintArea * 10) / 10 },
      { name: 'Excluded Windows/Doors', value: Math.round(excludeArea * 10) / 10 },
    ],
  };
};
