import { CalculationResult } from '../types';

export const calculateAge = (inputs: Record<string, number>): CalculationResult => {
  const birthYear = inputs.birthYear ?? 1990;
  const birthMonth = inputs.birthMonth ?? 1;
  const birthDay = inputs.birthDay ?? 1;
  const targetYear = inputs.targetYear ?? new Date().getFullYear();
  const targetMonth = inputs.targetMonth ?? new Date().getMonth() + 1;
  const targetDay = inputs.targetDay ?? new Date().getDate();

  const birth = new Date(birthYear, birthMonth - 1, birthDay);
  const target = new Date(targetYear, targetMonth - 1, targetDay);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  // Next birthday
  let nextBirthday = new Date(targetYear, birthMonth - 1, birthDay);
  if (nextBirthday < target) {
    nextBirthday = new Date(targetYear + 1, birthMonth - 1, birthDay);
  }
  const daysToBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  return {
    summary: {
      years: { label: 'Years', value: years, type: 'number' },
      months: { label: 'Months', value: months, type: 'number' },
      days: { label: 'Days', value: days, type: 'number' },
    },
  };
};
