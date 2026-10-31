import { CalculationResult } from '../types.js';

export const calculateAutoLoan = (inputs: Record<string, number>): CalculationResult => {
  const vehiclePrice = inputs.vehiclePrice ?? 0;
  const downPayment = inputs.downPayment ?? 0;
  const tradeIn = inputs.tradeIn ?? 0;
  const loanTermMonths = inputs.loanTerm ?? 60; // in months (typical: 36-84)
  const annualInterestRate = inputs.interestRate ?? 0;
  const salesTaxRate = inputs.salesTax ?? 0; // percentage, e.g. 8 = 8%

  const totalSalesTax = vehiclePrice * (salesTaxRate / 100);
  const principal = Math.max(0, vehiclePrice - downPayment - tradeIn + totalSalesTax);
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermMonths;

  // Guard against zero loan term causing division by zero
  if (numberOfPayments <= 0) {
    return {
      summary: {
        monthlyPayment: { label: 'Monthly Payment', value: 0, type: 'currency' },
        principal: { label: 'Loan Amount (Principal)', value: principal, type: 'currency' },
        totalSalesTax: { label: `Total Sales Tax (${salesTaxRate}% rate)`, value: totalSalesTax, type: 'currency' },
        totalInterest: { label: 'Total Interest Paid', value: 0, type: 'currency' },
        totalCost: { label: 'Total Cost of Vehicle', value: vehiclePrice + totalSalesTax, type: 'currency' },
      },
      chartData: [],
    };
  }

  let monthlyPayment = 0;
  if (monthlyInterestRate > 0) {
    monthlyPayment = 
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  } else {
    monthlyPayment = principal / numberOfPayments;
  }

  const totalInterestPaid = (monthlyPayment * numberOfPayments) - principal;
  const totalCost = vehiclePrice + totalSalesTax + totalInterestPaid;

  // Generate Chart Data (Annual scale for better visualization)
  let balance = principal;
  const chartData = [];
  const totalYears = Math.ceil(loanTermMonths / 12);
  let cumulativeInterest = 0;

  chartData.push({
    year: 0,
    balance: principal,
    principalPaid: 0,
    interestPaid: 0
  });

  for (let year = 1; year <= totalYears; year++) {
    let yearInterest = 0;
    
    const monthsInThisYear = Math.min(12, loanTermMonths - (year - 1) * 12);
    for (let month = 1; month <= monthsInThisYear; month++) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      yearInterest += interestPayment;
      balance = Math.max(0, balance - principalPayment);
    }
    
    cumulativeInterest += yearInterest;
    
    chartData.push({
      year,
      balance: Math.round(balance),
      principalPaid: Math.round(principal - balance),
      interestPaid: Math.round(cumulativeInterest)
    });
  }

  return {
    summary: {
      monthlyPayment: { label: 'Monthly Payment', value: monthlyPayment, type: 'currency' },
      principal: { label: 'Loan Amount (Principal)', value: principal, type: 'currency' },
      totalSalesTax: { label: `Total Sales Tax (${salesTaxRate}% rate)`, value: totalSalesTax, type: 'currency' },
      totalInterest: { label: 'Total Interest Paid', value: totalInterestPaid, type: 'currency' },
      totalCost: { label: 'Total Cost of Vehicle', value: totalCost, type: 'currency' }
    },
    chartData
  };
};