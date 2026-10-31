import { CalculationResult } from '../types.js';

/** Convert minutes from midnight to readable "HH:MM" time string */
function formatTimeString(totalMinutes: number): string {
  const normalizedMinutes = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalizedMinutes / 60);
  const m = normalizedMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const calculateSleep = (inputs: Record<string, number>): CalculationResult => {
  const mode = Math.round(inputs.mode ?? 0); // 0=Bedtime, 1=Wake Time
  const wakeHour = Math.round(inputs.wakeHour ?? 7);
  const wakeMinute = Math.round(inputs.wakeMinute ?? 0);
  const bedHour = Math.round(inputs.bedHour ?? 23);
  const bedMinute = Math.round(inputs.bedMinute ?? 0);
  const fallAsleepMinutes = Math.round(inputs.fallAsleepMinutes ?? 15);

  if (mode === 0) {
    // Calculate optimal bedtimes based on wake time
    const wakeTotalMinutes = wakeHour * 60 + wakeMinute;
    const results: Record<string, number> = {};
    const labels: string[] = [];

    for (let c = 1; c <= 6; c++) {
      const sleepMinutes = c * 90;
      const bedTotalMinutes = wakeTotalMinutes - sleepMinutes - fallAsleepMinutes;
      // Normalize to 0-1439 range (24-hour clock)
      const normalizedMinutes = ((bedTotalMinutes % 1440) + 1440) % 1440;
      const label = `${c} cycle${c > 1 ? 's' : ''} (${c * 1.5}h)`;
      labels.push(label);
      results[label] = normalizedMinutes;
    }

    return {
      summary: {
        wakeTime: { label: 'Wake Time', value: formatTimeString(wakeTotalMinutes), type: 'string' },
        result1: { label: '6 cycles (9h)', value: formatTimeString(results[labels[5]] || 0), type: 'string' },
        result2: { label: '5 cycles (7.5h)', value: formatTimeString(results[labels[4]] || 0), type: 'string' },
        result3: { label: '4 cycles (6h)', value: formatTimeString(results[labels[3]] || 0), type: 'string' },
      },
      chartData: [
        { name: '6 cycles (9h)', value: 6 * 90 },
        { name: '5 cycles (7.5h)', value: 5 * 90 },
        { name: '4 cycles (6h)', value: 4 * 90 },
        { name: '3 cycles (4.5h)', value: 3 * 90 },
      ],
    };
  } else {
    // Calculate wake times based on bedtime
    const bedTotalMinutes = bedHour * 60 + bedMinute;
    const results: Record<string, number> = {};
    const labels: string[] = [];

    for (let c = 1; c <= 6; c++) {
      const sleepMinutes = c * 90;
      const wakeTotalMinutes = bedTotalMinutes + sleepMinutes + fallAsleepMinutes;
      // Normalize to 0-1439 range (24-hour clock)
      const normalizedMinutes = ((wakeTotalMinutes % 1440) + 1440) % 1440;
      const label = `${c} cycle${c > 1 ? 's' : ''} (${c * 1.5}h)`;
      labels.push(label);
      results[label] = normalizedMinutes;
    }

    return {
      summary: {
        bedTime: { label: 'Bedtime', value: formatTimeString(bedTotalMinutes), type: 'string' },
        result1: { label: '6 cycles (9h)', value: formatTimeString(results[labels[5]] || 0), type: 'string' },
        result2: { label: '5 cycles (7.5h)', value: formatTimeString(results[labels[4]] || 0), type: 'string' },
        result3: { label: '4 cycles (6h)', value: formatTimeString(results[labels[3]] || 0), type: 'string' },
      },
      chartData: [
        { name: '6 cycles (9h)', value: 6 * 90 },
        { name: '5 cycles (7.5h)', value: 5 * 90 },
        { name: '4 cycles (6h)', value: 4 * 90 },
        { name: '3 cycles (4.5h)', value: 3 * 90 },
      ],
    };
  }
};