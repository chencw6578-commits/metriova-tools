import { describe, it, expect } from 'vitest';
import {
  calculateTip,
  calculatePercentage,
  calculateMortgage,
  calculateBMI,
  calculateCompoundInterest,
} from '../src/index';

describe('calculateTip', () => {
  it('splits a bill correctly', () => {
    const r = calculateTip({ billAmount: 100, tipPercentage: 15, numPeople: 4 });
    expect(r.summary.tipAmount.value).toBeCloseTo(15, 6);
    expect(r.summary.totalAmount.value).toBeCloseTo(115, 6);
    expect(r.summary.perPerson.value).toBeCloseTo(28.75, 6);
    expect(r.summary.tipPerPerson.value).toBeCloseTo(3.75, 6);
  });

  it('never divides by zero people', () => {
    const r = calculateTip({ billAmount: 100, tipPercentage: 20, numPeople: 0 });
    expect(r.summary.perPerson.value).toBeCloseTo(120, 6);
  });
});

describe('calculatePercentage', () => {
  it('mode 0: X% of Y', () => {
    const r = calculatePercentage({ mode: 0, value1: 20, value2: 150 });
    expect(r.summary.result.value).toBeCloseTo(30, 6);
  });

  it('mode 1: X is what % of Y', () => {
    const r = calculatePercentage({ mode: 1, value1: 30, value2: 150 });
    expect(r.summary.percentage.value).toBeCloseTo(20, 6);
  });

  it('mode 2: increase from X to Y', () => {
    const r = calculatePercentage({ mode: 2, value1: 100, value2: 150 });
    expect(r.summary.percentage.value).toBeCloseTo(50, 6);
  });

  it('mode 2: decrease from X to Y', () => {
    const r = calculatePercentage({ mode: 2, value1: 200, value2: 150 });
    expect(r.summary.percentage.value).toBeCloseTo(-25, 6);
  });
});

describe('calculateMortgage', () => {
  // Reference: standard amortization formula, verified independently.
  // P = 240,000 @ 6% annual, 30 years → monthly P&I ≈ 1,438.92
  it('computes the standard monthly payment', () => {
    const r = calculateMortgage({
      homePrice: 300000,
      downPayment: 60000,
      loanTerm: 30,
      interestRate: 6,
    });
    expect(r.summary.monthlyPayment.value).toBeCloseTo(1438.92, 1);
  });

  it('handles a zero-interest loan as principal / payments', () => {
    const r = calculateMortgage({
      homePrice: 120000,
      downPayment: 0,
      loanTerm: 10,
      interestRate: 0,
    });
    // 120000 / 120 = 1000
    expect(r.summary.monthlyPayment.value).toBeCloseTo(1000, 6);
  });
});

describe('calculateBMI', () => {
  it('computes BMI for 70kg / 175cm', () => {
    const r = calculateBMI({ weight: 70, height: 175 });
    expect(r.summary.bmi.value).toBeCloseTo(22.9, 1);
  });

  it('healthy range scales with height', () => {
    const r = calculateBMI({ weight: 70, height: 175 });
    // 1.75^2 = 3.0625 → 18.5*3.0625 = 56.65625, 24.9*3.0625 = 76.25625
    expect(r.summary.healthyMin.value).toBeCloseTo(56.7, 1);
    expect(r.summary.healthyMax.value).toBeCloseTo(76.3, 1);
  });
});

describe('calculateCompoundInterest', () => {
  it('matches (1+r/12)^12 for a single year with no contributions', () => {
    const r = calculateCompoundInterest({
      initialBalance: 1000,
      interestRate: 12,
      years: 1,
      monthlyContribution: 0,
    });
    // 1000 * 1.01^12 = 1126.82503...
    expect(r.summary.finalBalance.value).toBeCloseTo(1126.83, 1);
  });
});
