import { CalculationResult } from '../types.js';

export const calculateCreditCardPayoff = (inputs: Record<string, number>): CalculationResult => {
  const cardBalance = inputs.cardBalance ?? 0;
  const annualRate = inputs.interestRate ?? 0;
  const plannedPayment = inputs.monthlyPayment ?? 0;

  // Daily compounding: convert annual rate to daily rate
  const dailyRate = annualRate / 100 / 365;
  const daysPerMonth = 30;
  let balance = cardBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;

  const chartData = [];
  chartData.push({
    name: '0',
    value: Math.round(cardBalance),
    interestPaid: 0
  });

  // Zero balance: nothing to pay off
  if (cardBalance <= 0) {
    return {
      summary: {
        monthsToPayoff: { label: 'Months to Pay Off', value: 0, type: 'number' },
        totalInterest: { label: 'Total Interest Paid', value: 0, type: 'currency' },
        totalPaid: { label: 'Total Amount Paid', value: 0, type: 'currency' }
      },
      chartData
    };
  }

  // Check if payment can cover at least one month's interest (monthly check)
  const monthlyRate = annualRate / 100 / 12;
  const isInfeasible = plannedPayment <= 0 || (monthlyRate > 0 && plannedPayment <= cardBalance * monthlyRate);

  if (isInfeasible) {
    // Fixed: replaced sentinel -1 with clear warning message
    return {
      summary: {
        monthsToPayoff: { label: 'Months to Pay Off', value: 'Payment too low — monthly payment does not cover interest', type: 'string' },
        totalInterest: { label: 'Total Interest Paid', value: 0, type: 'currency' },
        totalPaid: { label: 'Total Amount Paid', value: 0, type: 'currency' }
      },
      chartData: []
    };
  }

  // Simulate day by day, aggregating into monthly payments.
  //
  // The loop stops at 1200 months (100 years) as a runaway guard. On its own that
  // guard used to exit with a positive balance and still report monthsToPayoff,
  // producing nonsense such as a 1.8e24 remaining balance alongside "payoff in
  // 1200 months". Stop on a cent-level remainder instead, then report the
  // shortfall explicitly below.
  while (balance > 0.005 && months < 1200) {
    months++;
    let monthInterest = 0;
    // Compound interest daily within each month
    for (let d = 0; d < daysPerMonth; d++) {
      const dailyInterest = balance * dailyRate;
      monthInterest += dailyInterest;
      balance += dailyInterest;
    }
    const payment = Math.min(balance, plannedPayment);
    
    totalInterest += monthInterest;
    totalPaid += payment;
    balance = Math.max(0, balance - payment);

    // Save chart sample (every month if <= 24 months, else every 3 or 6 or 12 months to avoid clutter)
    const shouldSample = 
      months === 1 || 
      balance <= 0.005 || 
      (months <= 24) || 
      (months <= 60 && months % 3 === 0) || 
      (months % 12 === 0);

    if (shouldSample) {
      chartData.push({
        name: String(months),
        value: Math.round(balance),
        interestPaid: Math.round(totalInterest)
      });
    }
  }

  // The balance survived the 100-year cap: this payment never clears the debt.
  // Reporting a payoff month here would be a lie, so say what is actually true
  // and show the payment that would work.
  if (balance > 0.005) {
    const minimumViablePayment = Math.ceil((cardBalance * monthlyRate + 1) * 100) / 100;
    return {
      summary: {
        monthsToPayoff: {
          label: 'Months to Pay Off',
          value: `Not payable — monthly payment is below the ${Math.ceil(minimumViablePayment * 100) / 100} needed to stop the balance growing`,
          type: 'string'
        },
        totalInterest: { label: 'Total Interest Paid', value: 0, type: 'currency' },
        totalPaid: { label: 'Total Amount Paid', value: 0, type: 'currency' }
      },
      chartData: []
    };
  }

  return {
    summary: {
      monthsToPayoff: { label: 'Months to Pay Off', value: months, type: 'number' },
      totalInterest: { label: 'Total Interest Paid', value: Math.round(totalInterest), type: 'currency' },
      totalPaid: { label: 'Total Amount Paid', value: Math.round(totalPaid), type: 'currency' }
    },
    chartData
  };
};