import { CalculationResult } from '../types';

export const calculateMulch = (inputs: Record<string, number>): CalculationResult => {
  const areaLength = inputs.mulchLength ?? 10; // meters
  const areaWidth = inputs.mulchWidth ?? 5; // meters
  const depth = inputs.depth ?? 5; // cm
  const bagVolume = inputs.bagVolume > 0 ? inputs.bagVolume : 50; // liters per bag
  const wastePercent = inputs.wastePercent ?? 5;

  const area = areaLength * areaWidth; // square meters
  const depthInMeters = depth / 100;
  const volumeNeeded = area * depthInMeters; // cubic meters
  const volumeWithWaste = volumeNeeded * (1 + wastePercent / 100);
  const volumeInLiters = volumeWithWaste * 1000;
  const bagsNeeded = Math.ceil(volumeInLiters / bagVolume);

  // Cost estimate if price per bag is provided
  // Currency symbol follows language setting (see DynamicForm.tsx getCurrencySymbol)
  const pricePerBag = inputs.pricePerBag ?? 0;
  const totalCost = bagsNeeded * pricePerBag;

  return {
    summary: {
      bagsNeeded: { label: 'Bags of Mulch Needed', value: bagsNeeded, type: 'bags' },
      volumeNeeded: { label: 'Total Volume Needed (cubic meters)', value: Math.round(volumeWithWaste * 100) / 100, type: 'cubic_meters' },
      coverageArea: { label: 'Coverage Area (sq m)', value: area, type: 'sq_meters' },
      totalCost: { label: 'Estimated Total Cost', value: totalCost, type: 'currency' },
    },
  };
};