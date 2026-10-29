import { CalculationResult } from '../types';

export const calculatePace = (inputs: Record<string, number>): CalculationResult => {
  const mode = Math.round(inputs.mode ?? 0); // 0=Pace, 1=Time, 2=Distance
  const distance = inputs.distance ?? 26.2;
  const hours = inputs.hours ?? 0;
  const minutes = inputs.minutes ?? 30;
  const seconds = inputs.seconds ?? 0;
  const paceMinutes = inputs.paceMinutes ?? 8;
  const paceSeconds = inputs.paceSeconds ?? 0;

  const totalTimeMinutes = hours * 60 + minutes + seconds / 60;
  const totalPaceSeconds = paceMinutes * 60 + paceSeconds;
  const totalPaceMinutes = totalPaceSeconds / 60;

  let paceMin = 0, paceSec = 0, totalTime = 0, totalDist = 0, speedMph = 0;

  if (mode === 0) {
    // Calculate pace from time and distance
    if (distance <= 0) {
      return {
        summary: {
          paceDisplay: { label: 'Pace', value: 0, type: 'number' },
          totalTime: { label: 'Total Time: 0h 0m', value: 0, type: 'number' },
          distance: { label: 'Distance (miles)', value: 0, type: 'number' },
          speed: { label: 'Speed (mph)', value: 0, type: 'number' },
        },
      };
    }
    totalTime = totalTimeMinutes;
    totalDist = distance;
    const paceDecimal = totalTimeMinutes / distance;
    paceMin = Math.floor(paceDecimal);
    paceSec = Math.round((paceDecimal - paceMin) * 60);
    // Carry overflow seconds into minutes (e.g. "8m 60s" -> "9m 0s")
    if (paceSec >= 60) {
      paceMin += 1;
      paceSec = 0;
    }
    // Guard against zero elapsed time (division by zero -> Infinity)
    speedMph = totalTimeMinutes > 0 ? distance / (totalTimeMinutes / 60) : 0;
  } else if (mode === 1) {
    // Calculate time from distance and pace
    if (distance <= 0 || totalPaceMinutes <= 0) {
      return {
        summary: {
          paceDisplay: { label: 'Pace', value: 0, type: 'number' },
          totalTime: { label: 'Total Time: 0h 0m', value: 0, type: 'number' },
          distance: { label: 'Distance (miles)', value: 0, type: 'number' },
          speed: { label: 'Speed (mph)', value: 0, type: 'number' },
        },
      };
    }
    totalDist = distance;
    totalTime = distance * totalPaceMinutes;
    speedMph = distance / (totalTime / 60);
    paceMin = paceMinutes;
    paceSec = paceSeconds;
  } else if (mode === 2) {
    // Calculate distance from time and pace
    if (totalPaceMinutes <= 0) {
      return {
        summary: {
          paceDisplay: { label: 'Pace', value: 0, type: 'number' },
          totalTime: { label: 'Total Time: 0h 0m', value: 0, type: 'number' },
          distance: { label: 'Distance (miles)', value: 0, type: 'number' },
          speed: { label: 'Speed (mph)', value: 0, type: 'number' },
        },
      };
    }
    totalTime = totalTimeMinutes;
    totalDist = totalTimeMinutes / totalPaceMinutes;
    speedMph = totalTimeMinutes > 0 ? totalDist / (totalTimeMinutes / 60) : 0;
    paceMin = paceMinutes;
    paceSec = paceSeconds;
  }

  const totalH = Math.floor(totalTime / 60);
  const totalM = Math.floor(totalTime % 60);

  return {
    summary: {
      paceDisplay: { label: 'Pace', value: paceMin * 60 + paceSec, type: 'number' },
      totalTime: { label: `Total Time: ${totalH}h ${totalM}m`, value: totalTime, type: 'number' },
      distance: { label: 'Distance (miles)', value: Math.round(totalDist * 100) / 100, type: 'number' },
      speed: { label: 'Speed (mph)', value: Math.round(speedMph * 100) / 100, type: 'number' },
    },
  };
};