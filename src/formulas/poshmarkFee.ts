import { CalculationResult } from '../types';

/**
 * Poshmark — US seller fee & profit calculator.
 *
 * Fee schedule (Poshmark official seller updates, verified 2026-10-11):
 * - Sale under $15: flat $2.95 commission
 * - Sale of $15 or more: 20% commission on the sale price
 *
 * Why this model differs from the Etsy/eBay engines:
 * - The commission absorbs everything: no separate payment-processing fee,
 *   no listing fee, no per-order fee.
 * - The buyer pays the $7.97 shipping label (up to 5 lb) directly, so the
 *   seller's gross revenue is the item price ALONE — buyer-paid shipping
 *   never passes through the seller's payout.
 * - The $15 threshold creates a pricing cliff worth surfacing as a number:
 *   just below it the flat fee is a bargain — $14.99 nets $12.04 (19.7%
 *   effective), while $15.00 nets $12.00 (20% effective). Below that zone
 *   the flat fee bites hardest — 29.5% of a $10 sale.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;
const r1 = (n: number) => Math.round(n * 10) / 10;

export const calculatePoshmarkFee = (inputs: Record<string, number>): CalculationResult => {
  const salePrice = inputs.salePrice ?? 25;
  const itemCost = inputs.itemCost ?? 12;
  // Poshmark buyers normally pay their own label; sellers only pay shipping
  // out of pocket when they send an offer with a shipping discount.
  const yourShipping = inputs.shippingLabel ?? 0;

  // Two-tier commission: flat below the threshold, percentage at or above it.
  const poshmarkFee = salePrice < 15 ? 2.95 : salePrice * 0.20;

  // Effective share of the sale kept by Poshmark — this is where the $15
  // cliff becomes visible: low-priced items pay far more than 20%.
  const effectiveFeeRate = salePrice > 0 ? (poshmarkFee / salePrice) * 100 : 0;

  const grossRevenue = salePrice;
  const totalCosts = itemCost + yourShipping + poshmarkFee;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    summary: {
      grossRevenue: { label: 'Gross Revenue', value: r2(grossRevenue), type: 'currency' },
      totalPoshmarkFees: { label: 'Total Poshmark Fees', value: r2(poshmarkFee), type: 'currency' },
      effectiveFeeRate: { label: 'Effective Fee Rate (%)', value: r1(effectiveFeeRate), type: 'percentage' },
      itemCost: { label: 'Item Cost', value: r2(itemCost), type: 'currency' },
      shippingCost: { label: 'Your Shipping Cost', value: r2(yourShipping), type: 'currency' },
      netProfit: { label: 'Net Profit', value: r2(netProfit), type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: r1(profitMargin), type: 'percentage' },
    },
    chartData: [
      { name: 'Item Cost', value: r2(itemCost) },
      { name: 'Poshmark Fees', value: r2(poshmarkFee) },
      { name: 'Shipping', value: r2(yourShipping) },
      { name: 'Net Profit', value: r2(netProfit) },
    ],
  };
};
