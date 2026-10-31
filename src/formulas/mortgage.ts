import { CalculationResult } from '../types.js';

export const calculateMortgage = (inputs: Record<string, number>): CalculationResult => {
  const homePrice = inputs.homePrice ?? 0;
  const downPayment = inputs.downPayment ?? 0;
  const loanTermYears = inputs.loanTerm ?? 30;
  const annualInterestRate = inputs.interestRate ?? 0;
  const annualPropertyTax = inputs.propertyTax ?? 0;
  const annualHomeInsurance = inputs.homeInsurance ?? 0;

  const principal = Math.max(0, homePrice - downPayment);
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Guard against zero loan term causing division by zero
  if (numberOfPayments <= 0) {
    return {
      summary: {
        monthlyPayment: { label: 'Monthly Payment', value: 0, type: 'currency' },
        principal: { label: 'Principal Amount', value: principal, type: 'currency' },
        totalInterest: { label: 'Total Interest', value: 0, type: 'currency' },
        totalCost: { label: 'Total Cost of Loan', value: principal, type: 'currency' },
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

  const totalInterestPaid = (monthlyPrincipalAndInterest * numberOfPayments) - principal;
  const totalCostOfLoan = principal + totalInterestPaid;

  // Generate Schedule and Chart Data
  let balance = principal;
  const chartData = [];
  
  let cumulativeInterest = 0;
  
  // Sample just a few points for the chart to keep it performant
  for (let year = 1; year <= loanTermYears; year++) {
    let yearInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = monthlyPrincipalAndInterest - interestPayment;

      yearInterest += interestPayment;
      balance -= principalPayment;
    }
    
    cumulativeInterest += yearInterest;
    
    chartData.push({
      year,
      balance: Math.max(0, balance),
      principalPaid: principal - Math.max(0, balance),
      interestPaid: cumulativeInterest
    });
  }

  return {
    summary: {
      monthlyPayment: { label: 'Monthly Payment', value: totalMonthlyPayment, type: 'currency' },
      principal: { label: 'Principal Amount', value: principal, type: 'currency' },
      totalInterest: { label: 'Total Interest', value: totalInterestPaid, type: 'currency' },
      totalCost: { label: 'Total Cost of Loan', value: totalCostOfLoan, type: 'currency' }
    },
    chartData
  };
};
