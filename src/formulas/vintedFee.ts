import { CalculationResult } from '../types';

/**
 * Vinted — seller-side calculator with a buyer-fee range model.
 *
 * Fee schedule (Vinted US/UK price lists via Vinted Help Centre, verified 2026-10-11):
 * - Sellers pay 0%: no listing fee, no commission, no processing deduction.
 *   The seller keeps the agreed item price in full.
 * - Buyers pay a Buyer Protection fee at checkout:
 *   - US: 5% of the item price + $0.70 (official US price list).
 *   - UK: officially "usually 3% to 8% plus £0.30 to £0.80", varying by item
 *     and order — modeled as a min/typical/max range rather than one number.
 *
 * The seller-relevant question on Vinted is pricing psychology: your payout
 * is the sale price, but the buyer's checkout total is higher, and that
 * total is what your listing competes against. This engine shows both.
 */
type Region = 'us' | 'uk';

// Static FX to USD (approximate Aug 2026 monthly averages; Fed G.5) — same
// convention as etsyFee.ts. UK flat fees are quoted in GBP and converted.
const FX_TO_USD: Record<Region, number> = { us: 1, uk: 1.35 };

const r2 = (n: number) => Math.round(n * 100) / 100;
const r1 = (n: number) => Math.round(n * 10) / 10;

export const calculateVintedFee = (inputs: Record<string, number>): CalculationResult => {
  const region: Region = Number(inputs.marketplace) === 2 ? 'uk' : 'us';
  const salePrice = inputs.salePrice ?? 30;
  const itemCost = inputs.itemCost ?? 12;
  const yourShipping = inputs.shippingLabel ?? 0; // seller-paid shipping is optional on Vinted

  // Seller side: zero. Kept explicit so the payout line is auditable.
  const vintedFee = 0;

  // Buyer-side Buyer Protection fee.
  const buyerFeeMin = region === 'us' ? salePrice * 0.05 + 0.7 : salePrice * 0.03 + 0.3 * FX_TO_USD.uk;
  const buyerFeeMax = region === 'us' ? salePrice * 0.05 + 0.7 : salePrice * 0.08 + 0.8 * FX_TO_USD.uk;
  const buyerFeeTypical = region === 'us' ? buyerFeeMin : salePrice * 0.055 + 0.55 * FX_TO_USD.uk;
  const isRange = region === 'uk';
  const buyerTotalMax = salePrice + buyerFeeMax;

  const grossRevenue = salePrice;
  const totalCosts = itemCost + yourShipping + vintedFee;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    summary: {
      yourPayout: { label: 'Your Payout (100% of sale price)', value: r2(grossRevenue), type: 'currency' },
      totalVintedFees: { label: 'Total Vinted Fees', value: r2(vintedFee), type: 'currency' },
      buyerProtectionFee: {
        label: isRange ? 'Buyer Protection Fee (typical, UK)' : 'Buyer Protection Fee (US)',
        value: r2(buyerFeeTypical),
        type: 'currency',
      },
      buyerProtectionFeeMax: {
        label: isRange ? 'Buyer Fee — Upper End (UK)' : 'Buyer Fee — Upper End',
        value: r2(buyerFeeMax),
        type: 'currency',
      },
      buyerTotal: { label: 'Est. Buyer Total (item + max fee)', value: r2(buyerTotalMax), type: 'currency' },
      itemCost: { label: 'Item Cost', value: r2(itemCost), type: 'currency' },
      shippingCost: { label: 'Your Shipping Cost', value: r2(yourShipping), type: 'currency' },
      netProfit: { label: 'Net Profit', value: r2(netProfit), type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: r1(profitMargin), type: 'percentage' },
    },
    chartData: [
      { name: 'Item Cost', value: r2(itemCost) },
      { name: 'Vinted Fees', value: r2(vintedFee) },
      { name: 'Shipping', value: r2(yourShipping) },
      { name: 'Net Profit', value: r2(netProfit) },
    ],
  };
};
