import { CalculationResult } from '../types';

export const calculateVaLoan = (inputs: Record<string, number>): CalculationResult => {
  const homePrice = inputs.homePrice ?? 0;
  const downPayment = inputs.downPayment ?? 0;
  const loanTermYears = inputs.loanTerm ?? 30;
  const annualInterestRate = inputs.interestRate ?? 0;
  const annualPropertyTax = inputs.propertyTax ?? 0;
  const annualHomeInsurance = inputs.homeInsurance ?? 0;
  // VA funding fee as a percentage (e.g. 2.3 for first use, 0% disabled)
  const fundingFeePercent = inputs.fundingFeePercent !== undefined ? inputs.fundingFeePercent : 2.3;

  const baseLoan = Math.max(0, homePrice - downPayment);
  const fundingFee = (baseLoan * fundingFeePercent) / 100;
  const principal = baseLoan + fundingFee;

  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Guard against zero loan term causing division by zero
  if (numberOfPayments <= 0) {
    return {
      summary: {
        monthlyPayment: { label: 'Monthly Payment', value: 0, type: 'currency' },
        principal: { label: 'Loan Amount (incl. funding fee)', value: principal, type: 'currency' },
        fundingFee: { label: 'VA Funding Fee', value: fundingFee, type: 'currency' },
        totalInterest: { label: 'Total Interest', value: 0, type: 'currency' },
      },
      chartData: [],
    };
  }

  let monthlyPrincipalAndInterest = 0;
  if (monthlyInterestRate > 0) {
    monthlyPrincipalAndInterest =
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  } else {
    monthlyPrincipalAndInterest = principal / numberOfPayments;
  }

  const monthlyPropertyTax = annualPropertyTax / 12;
  const monthlyHomeInsurance = annualHomeInsurance / 12;
  const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyHomeInsurance;

  const totalInterestPaid = monthlyPrincipalAndInterest * numberOfPayments - principal;

  return {
    summary: {
      monthlyPayment: { label: 'Monthly Payment', value: totalMonthlyPayment, type: 'currency' },
      principal: { label: 'Loan Amount (incl. funding fee)', value: principal, type: 'currency' },
      fundingFee: { label: 'VA Funding Fee', value: fundingFee, type: 'currency' },
      totalInterest: { label: 'Total Interest', value: totalInterestPaid, type: 'currency' },
    },
    chartData: [
      { name: 'Principal & Interest', value: monthlyPrincipalAndInterest },
      { name: 'Property Tax', value: monthlyPropertyTax },
      { name: 'Insurance', value: monthlyHomeInsurance },
    ],
  };
};
