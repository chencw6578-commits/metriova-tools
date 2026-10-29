import { CalculationResult } from '../types';

export const calculateDiscount = (inputs: Record<string, number>): CalculationResult => {
  const originalPrice = inputs.originalPrice ?? 0;
  const discountPercent = inputs.discountPercent ?? 0;
  const additionalDiscount = inputs.additionalDiscount ?? 0;

  // Discount calculation: first discount is applied to the original price,
  // then additional discount is applied to the already-reduced price (stacked/multiplicative, not additive)
  const firstDiscountAmount = originalPrice * (discountPercent / 100);
  const priceAfterFirstDiscount = originalPrice - firstDiscountAmount;
  const additionalDiscountAmount = priceAfterFirstDiscount * (additionalDiscount / 100);
  const finalPrice = priceAfterFirstDiscount - additionalDiscountAmount;
  const totalSavings = originalPrice - finalPrice;
  const effectiveDiscount = originalPrice > 0 ? (totalSavings / originalPrice) * 100 : 0;

  return {
    summary: {
      finalPrice: { label: 'Final Price', value: finalPrice, type: 'currency' },
      totalSavings: { label: 'Total Savings', value: totalSavings, type: 'currency' },
      effectiveDiscount: { label: 'Effective Discount Rate', value: effectiveDiscount, type: 'percentage' },
    },
    chartData: []
  };
};