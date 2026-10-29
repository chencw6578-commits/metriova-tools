import { CalculationResult } from '../types';

export const calculateDate = (inputs: Record<string, number>): CalculationResult => {
  const mode = Math.round(inputs.mode ?? 0); // 0=Days Between, 1=Add Days
  const startYear = Math.round(inputs.startYear ?? 2026);
  const startMonth = Math.round(inputs.startMonth ?? 1);
  const startDay = Math.round(inputs.startDay ?? 1);
  const endYear = Math.round(inputs.endYear ?? 2026);
  const endMonth = Math.round(inputs.endMonth ?? 12);
  const endDay = Math.round(inputs.endDay ?? 31);
  const addDays = inputs.addDays ?? 90;

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  if (mode === 0) {
    // === Days Between ===
    const diffTime = endDate.getTime() - startDate.getTime();
    const rawDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isNegative = rawDays < 0;
    const absDays = Math.abs(rawDays);

    // Calculate additional breakdown: weeks, months, years
    const totalWeeks = absDays / 7;
    const totalMonths = absDays / 30.4375; // average days per month
    const totalYears = absDays / 365.25; // accounting for leap years

    const sign = isNegative ? -1 : 1;

    return {
      summary: {
        totalDays: {
          label: 'Total Days',
          value: isNegative ? -absDays : absDays,
          type: 'number',
        },
        totalWeeks: {
          label: 'Total Weeks',
          value: Math.round(totalWeeks * 10) / 10 * sign,
          type: 'number',
        },
        totalMonths: {
          label: 'Total Months (approx.)',
          value: Math.round(totalMonths * 10) / 10 * sign,
          type: 'number',
        },
        totalYears: {
          label: 'Total Years (approx.)',
          value: Math.round(totalYears * 10) / 10 * sign,
          type: 'number',
        },
      },
    };
  } else {
    // === Add Days to Date ===
    const resultDate = new Date(startDate);
    resultDate.setDate(resultDate.getDate() + addDays);
    const resultYear = resultDate.getFullYear();
    const resultMonth = resultDate.getMonth() + 1;
    const resultDay = resultDate.getDate();

    return {
      summary: {
        resultDate: {
          label: `${resultYear}-${String(resultMonth).padStart(2, '0')}-${String(resultDay).padStart(2, '0')}`,
          value: resultDate.getTime(),
          type: 'date',
        },
      },
    };
  }
};