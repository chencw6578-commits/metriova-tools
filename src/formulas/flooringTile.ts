import { CalculationResult } from '../types';

export const calculateFlooringTile = (inputs: Record<string, number>): CalculationResult => {
  const areaLength = inputs.areaLength ?? 5;
  const areaWidth = inputs.areaWidth ?? 4;
  const tileLength = inputs.tileLength ?? 60; // in cm
  const tileWidth = inputs.tileWidth ?? 60; // in cm
  const wastage = inputs.wastage !== undefined ? inputs.wastage : 10;
  const packSize = inputs.packSize > 0 ? inputs.packSize : 8;

  const floorArea = areaLength * areaWidth; // in m²
  const tileArea = (tileLength / 100) * (tileWidth / 100); // in m²
  
  const rawTileCount = tileArea > 0 ? floorArea / tileArea : 0;
  const wastageTiles = rawTileCount * (wastage / 100);
  const totalTilesNeeded = Math.ceil(rawTileCount + wastageTiles);
  const boxesNeeded = Math.ceil(totalTilesNeeded / packSize);

  return {
    summary: {
      floorArea: { label: 'Floor Surface Area', value: floorArea, type: 'sq_meters' },
      tileArea: { label: 'Single Tile Area', value: tileArea, type: 'sq_meters' },
      rawTiles: { label: 'Base Tiles Required', value: Math.ceil(rawTileCount), type: 'pieces' },
      totalTiles: { label: 'Total Tiles Needed', value: totalTilesNeeded, type: 'pieces' },
      boxesNeeded: { label: 'Total Boxes Needed', value: boxesNeeded, type: 'boxes' },
    },
    chartData: [
      { name: 'Base Tiles Required', value: Math.ceil(rawTileCount) },
      { name: 'Wastage Margin Tiles', value: Math.ceil(wastageTiles) },
    ],
  };
};
