import { CalculationResult } from '../types.js';

// Progressive income tax brackets by country (2025/26 public rates).
// US: 2025 federal single-filer brackets. UK: 2025/26. DE: 2025 (Grundtarif). FR: 2025 (métropole).
// Currency symbols are shown in labels; amounts are entered in the local currency.
// IMPORTANT: These rates are based on 2025/26 tax year. Tax rates may change annually.
const COUNTRY_BRACKETS: Record<number, { name: string; currency: string; standardDeduction: number; brackets: Array<{ upTo: number; rate: number }> }> = {
  0: {
    name: 'US',
    currency: 'USD ($)',
    standardDeduction: 15000, // 2025 single
    brackets: [
      { upTo: 11925, rate: 10 },
      { upTo: 48475, rate: 12 },
      { upTo: 103350, rate: 22 },
      { upTo: 197300, rate: 24 },
      { upTo: 250525, rate: 32 },
      { upTo: 626350, rate: 35 },
      { upTo: Infinity, rate: 37 },
    ],
  },
  1: {
    name: 'UK',
    currency: 'GBP (£)',
    standardDeduction: 12570, // 2025/26 Personal Allowance
    brackets: [
      { upTo: 50270, rate: 20 },
      { upTo: 125140, rate: 40 },
      { upTo: Infinity, rate: 45 },
    ],
  },
  2: {
    name: 'Germany',
    currency: 'EUR (€)',
    standardDeduction: 12096, // 2025 Grundfreibetrag
    brackets: [
      { upTo: 17443, rate: 14 },
      { upTo: 68480, rate: 24 },
      { upTo: 277825, rate: 42 },
      { upTo: Infinity, rate: 45 },
    ],
  },
  3: {
    name: 'France',
    currency: 'EUR (€)',
    standardDeduction: 0, // France uses quotient familial
    brackets: [
      { upTo: 11497, rate: 0 },
      { upTo: 29315, rate: 11 },
      { upTo: 83823, rate: 30 },
      { upTo: 180294, rate: 41 },
      { upTo: Infinity, rate: 45 },
    ],
  },
};

export const calculateIncomeTax = (inputs: Record<string, number>): CalculationResult => {
  const grossIncome = inputs.grossIncome ?? 0;
  const manualDeductions = inputs.deductions ?? 0;
  const manualRate = inputs.incomeTaxRate ?? 0;
  const countryCode = Math.round(inputs.countryCode ?? 0);

  const country = COUNTRY_BRACKETS[countryCode] || COUNTRY_BRACKETS[0];
  const { name: countryName, currency: _currency, standardDeduction, brackets } = country;

  // Taxpayers take the LARGER of their itemized deductions and the standard
  // deduction — never just one. The previous logic
  // (`manualDeductions > 0 ? manualDeductions : standardDeduction`) silently
  // discarded the standard deduction whenever ANY positive value was entered,
  // so e.g. $3,000 of itemized deductions against a $15,000 standard deduction
  // INCREASED the tax by ~$2,640 (US 2025, $80,000 income). Math.max keeps
  // whichever deduction is better for the taxpayer, matching how filing
  // actually works in every country modeled here.
  const effectiveDeduction = Math.max(manualDeductions, standardDeduction);
  const taxableIncome = Math.max(0, grossIncome - effectiveDeduction);

  // When the user supplies a manual effective rate (legacy mode), use it directly.
  const useManualRate = manualRate > 0 && countryCode === 0 && inputs.incomeTaxRate !== undefined;
  let taxOwed: number;

  if (useManualRate) {
    taxOwed = taxableIncome * (manualRate / 100);
  } else {
    let remaining = taxableIncome;
    taxOwed = 0;
    let prev = 0;
    for (const b of brackets) {
      const slice = Math.min(remaining, Math.max(0, b.upTo - prev));
      taxOwed += slice * (b.rate / 100);
      remaining -= slice;
      prev = b.upTo;
      if (remaining <= 0) break;
    }
  }

  const netIncome = grossIncome - taxOwed;
  const effectiveRate = grossIncome > 0 ? (taxOwed / grossIncome) * 100 : 0;

  return {
    summary: {
      netIncomeByCountry: { label: `Net Income (${countryName}) — 2025/26 tax year rates`, value: netIncome, type: 'currency' },
      taxOwedByCountry: { label: `Total Tax Owed (${countryName})`, value: taxOwed, type: 'currency' },
      taxableIncome: { label: 'Taxable Income', value: taxableIncome, type: 'currency' },
      effectiveRate: { label: 'Effective Tax Rate', value: effectiveRate, type: 'percentage' },
    },
    chartData: [
      { name: 'Net Income', value: netIncome },
      { name: 'Tax Owed', value: taxOwed },
      { name: 'Deductions', value: Math.max(0, effectiveDeduction) },
    ],
  };
};
