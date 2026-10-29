import { CalculationResult } from '../types';

export const calculateConcrete = (inputs: Record<string, number>): CalculationResult => {
  const slabLength = inputs.slabLength ?? 4;
  const slabWidth = inputs.slabWidth ?? 3;
  const slabThickness = inputs.slabThickness ?? 10; // in cm
  const ratioCement = inputs.ratioCement ?? 1;
  const ratioSand = inputs.ratioSand ?? 2;
  const ratioGravel = inputs.ratioGravel ?? 4;
  const wastage = inputs.wastage !== undefined ? inputs.wastage : 5;

  const thicknessMeters = slabThickness / 100;
  const wetVolume = slabLength * slabWidth * thicknessMeters; // in m³
  const totalWetVolume = wetVolume * (1 + wastage / 100); // in m³

  // Dry mix volume is approximately 1.54 times the wet volume due to shrinkage when water is added
  const dryVolume = totalWetVolume * 1.54;

  const totalParts = ratioCement + ratioSand + ratioGravel;
  
  let cementVol = 0;
  let sandVol = 0;
  let gravelVol = 0;

  if (totalParts > 0) {
    cementVol = dryVolume * (ratioCement / totalParts);
    sandVol = dryVolume * (ratioSand / totalParts);
    gravelVol = dryVolume * (ratioGravel / totalParts);
  }

  // Cement properties: Density ~1440 kg/m³, standard bag is 50kg
  const cementWeightKg = cementVol * 1440;
  const cementBags = Math.ceil(cementWeightKg / 50);

  // Sand properties: Density ~1600 kg/m³
  const sandWeightKg = sandVol * 1600;

  // Gravel properties: Density ~1600 kg/m³
  const gravelWeightKg = gravelVol * 1600;

  return {
    summary: {
      wetVolume: { label: 'Net Concrete Volume', value: wetVolume, type: 'cubic_meters' },
      totalWetVolume: { label: 'Total Volume Required', value: totalWetVolume, type: 'cubic_meters' },
      cementBags: { label: 'Cement Needed (50kg Bags)', value: cementBags, type: 'bags' },
      sandWeight: { label: 'Sand Needed', value: Math.round(sandWeightKg), type: 'kg' },
      gravelWeight: { label: 'Gravel Needed', value: Math.round(gravelWeightKg), type: 'kg' },
    },
    chartData: [
      { name: 'Cement Weight', value: Math.round(cementWeightKg) },
      { name: 'Sand Weight', value: Math.round(sandWeightKg) },
      { name: 'Gravel Weight', value: Math.round(gravelWeightKg) },
    ],
  };
};
