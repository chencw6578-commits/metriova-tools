import { CalculationResult } from '../types.js';

/**
 * Mercari — US seller fee calculator.
 *
 * Fee schedule (Mercari Help Center, verified 2026-10-11):
 * - One flat 10% selling fee.
 * - The separate payment-processing fee (2.9% + $0.50) was eliminated on
 *   January 6, 2025 — a large share of third-party calculators still add
 *   it on top and overstate the fees by nearly $2 on a $50 sale.
 * - The 10% is applied to the order amount INCLUDING the shipping the
 *   buyer pays. This is the detail that catches sellers out: you are
 *   charged 10% on money (shipping) that goes straight to the carrier.
 *
 * This engine therefore splits the fee into "on item" and "on shipping"
 * so the shipping surcharge is visible instead of buried in one number.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;
const r1 = (n: number) => Math.round(n * 10) / 10;

export const calculateMercariFee = (inputs: Record<string, number>): CalculationResult => {
  const salePrice = inputs.salePrice ?? 30;
  const buyerShipping = inputs.buyerShipping ?? 8; // shipping the buyer pays you
  const itemCost = inputs.itemCost ?? 12;
  const yourShipping = inputs.shippingLabel ?? 8; // what the label actually costs you

  // 10% selling fee — base includes buyer-paid shipping.
  const feeOnItem = salePrice * 0.10;
  const feeOnShipping = buyerShipping * 0.10;
  const mercariFee = feeOnItem + feeOnShipping;

  const grossRevenue = salePrice + buyerShipping;
  const totalCosts = itemCost + yourShipping + mercariFee;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

  return {
    summary: {
      grossRevenue: { label: 'Gross Revenue (item + shipping paid by buyer)', value: r2(grossRevenue), type: 'currency' },
      totalMercariFees: { label: 'Total Mercari Fees', value: r2(mercariFee), type: 'currency' },
      feeOnItem: { label: 'Selling Fee on Item (10%)', value: r2(feeOnItem), type: 'currency' },
      feeOnShipping: { label: 'Selling Fee on Buyer-Paid Shipping (10%)', value: r2(feeOnShipping), type: 'currency' },
      itemCost: { label: 'Item Cost', value: r2(itemCost), type: 'currency' },
      shippingCost: { label: 'Your Shipping Cost', value: r2(yourShipping), type: 'currency' },
      netProfit: { label: 'Net Profit', value: r2(netProfit), type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: r1(profitMargin), type: 'percentage' },
    },
    chartData: [
      { name: 'Item Cost', value: r2(itemCost) },
      { name: 'Mercari Fees', value: r2(mercariFee) },
      { name: 'Shipping', value: r2(yourShipping) },
      { name: 'Net Profit', value: r2(netProfit) },
    ],
  };
};
