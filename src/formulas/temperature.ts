import { CalculationResult } from '../types';
import type { InputType } from '../types';

export const calculateTemperature = (inputs: Record<string, number>): CalculationResult => {
  const value = inputs.value ?? 100;
  const fromUnit = Math.round(inputs.fromUnit ?? 1); // 0=F, 1=C, 2=K

  // Convert input to Celsius first
  let celsius = 0;
  let fromLabel = '';
  if (fromUnit === 0) { // Fahrenheit → Celsius
    celsius = (value - 32) * 5 / 9;
    fromLabel = `${value}°F`;
  } else if (fromUnit === 1) { // Celsius
    celsius = value;
    fromLabel = `${value}°C`;
  } else if (fromUnit === 2) { // Kelvin → Celsius
    celsius = value - 273.15;
    fromLabel = `${value}K`;
  }

  // Convert Celsius to all units
  const toFahrenheit = celsius * 9 / 5 + 32;
  const toCelsius = celsius;
  const toKelvin = celsius + 273.15;

  // Show the other two units (not the input unit)
  const summary: Record<string, { label: string; value: number; type: InputType }> = {};

  if (fromUnit === 0) {
    // Input: Fahrenheit, show Celsius + Kelvin
    summary.celsius = { label: 'Celsius (°C)', value: Math.round(toCelsius * 100) / 100, type: 'number' };
    summary.kelvin = { label: 'Kelvin (K)', value: Math.round(toKelvin * 100) / 100, type: 'number' };
  } else if (fromUnit === 1) {
    // Input: Celsius, show Fahrenheit + Kelvin
    summary.fahrenheit = { label: 'Fahrenheit (°F)', value: Math.round(toFahrenheit * 100) / 100, type: 'number' };
    summary.kelvin = { label: 'Kelvin (K)', value: Math.round(toKelvin * 100) / 100, type: 'number' };
  } else {
    // Input: Kelvin, show Fahrenheit + Celsius
    summary.fahrenheit = { label: 'Fahrenheit (°F)', value: Math.round(toFahrenheit * 100) / 100, type: 'number' };
    summary.celsius = { label: 'Celsius (°C)', value: Math.round(toCelsius * 100) / 100, type: 'number' };
  }

  return {
    summary,
  };
};