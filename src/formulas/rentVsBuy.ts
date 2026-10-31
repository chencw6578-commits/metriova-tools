import { CalculationResult } from '../types.js';

export const calculateRentVsBuy = (inputs: Record<string, number>): CalculationResult => {
  const homePrice = inputs.homePrice ?? 300000;
  const downPayment = inputs.downPayment ?? 60000;
  const mortgageRate = inputs.mortgageRate ?? 6.5;
  const loanTermYears = inputs.loanTerm ?? 30;
  const propertyTaxAnnual = inputs.propertyTaxAnnual ?? 3600;
  const homeInsuranceAnnual = inputs.homeInsuranceAnnual ?? 1200;
  const maintenancePercent = inputs.maintenancePercent ?? 1; // % of home price per year
  const rentMonthly = inputs.rentMonthly ?? 1800;
  const rentIncreasePercent = inputs.rentIncreasePercent ?? 3;
  const homeAppreciationPercent = inputs.homeAppreciationPercent ?? 3;
  const investmentReturnPercent = inputs.investmentReturnPercent ?? 7;
  const timeHorizon = inputs.timeHorizon ?? 10; // years to compare

  const loanAmount = Math.max(0, homePrice - downPayment);
  const monthlyRate = mortgageRate / 100 / 12;
  const months = loanTermYears * 12;

  // Guard against a zero or negative loan term: `months` is a divisor below and
  // the amortization loop is driven by it, so without this the result card
  // renders NaN for every field. Mirrors the guards in mortgage.ts / loan.ts.
  if (months <= 0) {
    return {
      summary: {
        monthlyBuyCost: { label: 'Monthly Cost to Buy', value: 0, type: 'currency' },
        rentMonthly: { label: 'Monthly Rent (today)', value: rentMonthly, type: 'currency' },
        breakEvenYear: { label: 'Break-Even Year (enter a loan term above 0 years)', value: 0, type: 'number' },
        finalBuyNetWorth: { label: 'Buy Net Worth (year ' + timeHorizon + ')', value: 0, type: 'currency' },
        finalRentNetWorth: { label: 'Rent Net Worth (year ' + timeHorizon + ')', value: 0, type: 'currency' },
      },
      chartData: [],
    };
  }

  let monthlyPmi = 0;
  let monthlyPrincipalAndInterest = 0;
  if (monthlyRate > 0) {
    monthlyPrincipalAndInterest =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  } else {
    monthlyPrincipalAndInterest = loanAmount / months;
  }
  // PMI if down payment < 20%. Guard homePrice=0, which would make this NaN.
  const downPaymentPct = homePrice > 0 ? downPayment / homePrice : 0;
  if (downPaymentPct < 0.2) {
    monthlyPmi = (loanAmount * 0.005) / 12;
  }
  // One-time buying transaction costs (loan origination, title, appraisal,
  // inspection — typically 2-3% of the purchase price). Without these the
  // default scenario broke even in year 1, contradicting the 5-7 year rule
  // of thumb this page teaches; transaction costs are exactly what makes
  // short horizons favor renting.
  const closingCosts = homePrice * 0.03;
  const monthlyTax = propertyTaxAnnual / 12;
  const monthlyInsurance = homeInsuranceAnnual / 12;
  const monthlyMaintenance = (homePrice * maintenancePercent) / 100 / 12;
  const monthlyBuyCost = monthlyPrincipalAndInterest + monthlyPmi + monthlyTax + monthlyInsurance + monthlyMaintenance;

  // Year-by-year comparison
  const chartData = [];
  let buyNetWorth = 0;
  let rentNetWorth = 0;
  let mortgageBalance = loanAmount;
  let breakEvenYear = null;

  for (let year = 1; year <= timeHorizon; year++) {
    for (let m = 1; m <= 12; m++) {
      const interestPayment = mortgageBalance * monthlyRate;
      const principalPayment = monthlyPrincipalAndInterest - interestPayment;
      mortgageBalance = Math.max(0, mortgageBalance - principalPayment);
    }
    const homeValue = homePrice * Math.pow(1 + homeAppreciationPercent / 100, year);
    const equity = homeValue - mortgageBalance;
    // Symmetric net-worth: equity already includes the down payment's house
    // value, so do NOT subtract downPayment again (rent side counts the
    // invested down payment). Subtracting it biased the comparison toward renting.
    // Closing costs are a sunk cost the buyer never recovers, so they reduce
    // the buy side in every year.
    buyNetWorth = equity - closingCosts;

    rentNetWorth = rentNetWorth * (1 + investmentReturnPercent / 100);
    for (let m2 = 1; m2 <= 12; m2++) {
      // Rent compounds ANNUALLY, so the exponent must carry the years already
      // elapsed. The previous (m2 - 1) / 12 reset growth to zero every January,
      // which left rent effectively flat across a 10-year projection and
      // systematically overstated how attractive renting looks.
      const yearsElapsed = year - 1 + (m2 - 1) / 12;
      rentNetWorth += (monthlyBuyCost - rentMonthly * Math.pow(1 + rentIncreasePercent / 100, yearsElapsed)) * Math.pow(1 + investmentReturnPercent / 100, (12 - m2) / 12);
    }
    if (year === 1) {
      // Cash-symmetric start: a renter keeps the same up-front cash the buyer
      // spends (down payment + closing costs), so both amounts get invested.
      rentNetWorth += (downPayment + closingCosts) * Math.pow(1 + investmentReturnPercent / 100, 1);
    }

    chartData.push({
      name: String(year),
      value: Math.round(buyNetWorth - rentNetWorth),
    });

    if (breakEvenYear === null && buyNetWorth >= rentNetWorth) {
      breakEvenYear = year;
    }
  }

  const breakEvenLabel = breakEvenYear !== null
    ? `Break-Even Year (buy wins from year ${breakEvenYear})`
    : `Break-Even Year (not reached within ${timeHorizon}-year projection)`;

  return {
    summary: {
      monthlyBuyCost: { label: 'Monthly Cost to Buy', value: Math.round(monthlyBuyCost), type: 'currency' },
      rentMonthly: { label: 'Monthly Rent (today)', value: rentMonthly, type: 'currency' },
      breakEvenYear: { label: breakEvenLabel, value: breakEvenYear ?? timeHorizon, type: 'number' },
      finalBuyNetWorth: { label: 'Buy Net Worth (year ' + timeHorizon + ')', value: Math.round(buyNetWorth), type: 'currency' },
      finalRentNetWorth: { label: 'Rent Net Worth (year ' + timeHorizon + ')', value: Math.round(rentNetWorth), type: 'currency' },
    },
    chartData,
  };
};