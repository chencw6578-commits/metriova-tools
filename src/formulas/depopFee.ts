import { CalculationResult } from '../types';

/**
 * Depop — US seller calculator with a buyer-side lens.
 *
 * Fee schedule (Depop Help Centre — Seller fees and charges, verified 2026-10-11):
 * - 0% selling fee for sellers in the US, UK and Australia (the 10% selling
 *   fee was removed in the US in July 2024).
 * - Sellers using Depop Payments in the US pay no payment-processing fee.
 * - Buyers pay a Marketplace fee of up to 5% of the item price plus up to
 *   $1, charged at checkout on the item price only (excludes taxes and
 *   shipping). The exact amount is shown to the buyer at checkout.
 *
 * With the seller side at zero, the numbers that actually decide a Depop
 * sale are on the buyer's receipt: this engine models BOTH sides — your
 * $0-fee payout and the worst-case buyer total — because that total is
 * what your listing price is really competing against.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;
const r1 = (n: number) => Math.round(n * 10) / 10;

export const calculateDepopFee = (inputs: Record<string, number>): CalculationResult => {
  const salePrice = inputs.salePrice ?? 30;
  const itemCost = inputs.itemCost ?? 12;
  // Depop buyers normally pay their own shipping; a seller only pays out of
  // pocket when offering free shipping to close a sale.
  const yourShipping = inputs.shippingLabel ?? 0;

  // Seller side: zero. Kept as an explicit line so the payout math is auditable.
  const depopFee = 0;

  // Buyer side (worst case): up to 5% + $1 on the item price.
  const buyerMarketplaceFee = salePrice * 0.05 + 1.0;
  const buyerTotal = salePrice + buyerMarketplaceFee;

  const grossRevenue = salePrice;
  const totalCosts = itemCost + yourShipping + depopFee;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    summary: {
      grossRevenue: { label: 'Gross Revenue', value: r2(grossRevenue), type: 'currency' },
      totalDepopFees: { label: 'Total Depop Fees', value: r2(depopFee), type: 'currency' },
      buyerMarketplaceFee: { label: 'Buyer Marketplace Fee (max est.)', value: r2(buyerMarketplaceFee), type: 'currency' },
      buyerTotal: { label: 'Est. Buyer Total (item + max fee)', value: r2(buyerTotal), type: 'currency' },
      itemCost: { label: 'Item Cost', value: r2(itemCost), type: 'currency' },
      shippingCost: { label: 'Your Shipping Cost', value: r2(yourShipping), type: 'currency' },
      netProfit: { label: 'Net Profit', value: r2(netProfit), type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: r1(profitMargin), type: 'percentage' },
    },
    chartData: [
      { name: 'Item Cost', value: r2(itemCost) },
      { name: 'Depop Fees', value: r2(depopFee) },
      { name: 'Shipping', value: r2(yourShipping) },
      { name: 'Net Profit', value: r2(netProfit) },
    ],
  };
};
