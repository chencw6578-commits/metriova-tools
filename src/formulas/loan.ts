import { CalculationResult, ScheduleItem } from '../types.js';

export const calculateLoan = (inputs: Record<string, number>): CalculationResult => {
  const loanAmount = inputs.loanAmount ?? 10000;
  const interestRate = inputs.interestRate ?? 8;
  const loanTerm = inputs.loanTerm ?? 3; // in years

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  // Guard against zero loan term which causes division by zero
  if (numPayments <= 0) {
    return {
      summary: {
        monthlyPayment: { label: 'Monthly Payment', value: loanAmount, type: 'currency' },
        totalPayment: { label: 'Total Payment (over ' + loanTerm + ' years)', value: loanAmount, type: 'currency' },
        totalInterest: { label: 'Total Interest', value: 0, type: 'currency' },
      },
      chartData: [
        { name: 'Principal', value: loanAmount },
        { name: 'Interest', value: 0 },
      ],
      schedule: [],
    };
  }

  let monthlyPayment = 0;
  let totalPayment = 0;
  let totalInterest = 0;

  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numPayments;
  } else {
    const factor = Math.pow(1 + monthlyRate, numPayments);
    monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  totalPayment = monthlyPayment * numPayments;
  totalInterest = totalPayment - loanAmount;

  // Generate amortization schedule (first 12 months + annual milestones)
  const schedule: ScheduleItem[] = [];
  let balance = loanAmount;
  // Schedule display capped at 360 months (30 years) to avoid overly long output
  const scheduleLimit = Math.min(numPayments, 360);
  for (let i = 1; i <= scheduleLimit; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    if (i <= 12 || i === numPayments || i === scheduleLimit || i % 12 === 0) {
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }
  }

  return {
    summary: {
      monthlyPayment: { label: 'Monthly Payment', value: monthlyPayment, type: 'currency' },
      totalPayment: { label: 'Total Payment (over ' + loanTerm + ' years)', value: totalPayment, type: 'currency' },
      totalInterest: { label: 'Total Interest', value: totalInterest, type: 'currency' },
    },
    chartData: [
      { name: 'Principal', value: loanAmount },
      { name: 'Interest', value: totalInterest },
    ],
    schedule,
  };
};