import { CalculationResult } from '../types.js';

/**
 * Etsy — multi-market fee & profit calculator.
 *
 * De-localization fix: the 6.5% transaction fee applies worldwide, but the
 * payment-processing rates and flat fees are country-specific. The seller
 * picks a region (US / Europe / UK / Japan) and the processing table and
 * display currency switch together.
 *
 * Region keys: 1 = United States, 2 = Europe, 3 = United Kingdom, 4 = Japan.
 * Source: Etsy Help — Payment Processing Fees (etsy.com/legal/fees), 2026.
 */
type Region = 'us' | 'eu' | 'uk' | 'jp';

function resolveRegion(v?: number): Region {
  const m = Number(v);
  if (m === 2) return 'eu';
  if (m === 3) return 'uk';
  if (m === 4) return 'jp';
  return 'us';
}

const REGION_CONFIG: Record<
  Region,
  { label: string; processingPercent: number; processingFlat: number; listingFee: number }
> = {
  us: {
    label: 'United States',
    processingPercent: 3,
    processingFlat: 0.25, // USD
    listingFee: 0.2, // USD
  },
  eu: {
    label: 'Europe',
    processingPercent: 4,
    processingFlat: 0.3, // EUR
    listingFee: 0.2, // EUR (≈ the global USD 0.20 listing fee)
  },
  uk: {
    label: 'United Kingdom',
    processingPercent: 4,
    processingFlat: 0.2, // GBP
    listingFee: 0.2, // GBP (≈ the global USD 0.20 listing fee)
  },
  jp: {
    label: 'Japan',
    processingPercent: 6,
    processingFlat: 45, // JPY (≈ the published USD 0.30 flat, converted)
    listingFee: 30, // JPY (≈ the global USD 0.20 listing fee, converted)
  },
};

// Static FX to USD (approximate Aug 2026 monthly averages; Fed G.5). The region
// flat fees above are quoted in the local currency while the price and cost
// inputs are in US dollars, so the flat fees are converted to USD.
const FX_TO_USD: Record<Region, number> = {
  us: 1,
  eu: 1.16, // EUR
  uk: 1.35, // GBP
  jp: 0.0063, // JPY (≈ 1 / 158.7)
};

export const calculateEtsyFee = (inputs: Record<string, number>): CalculationResult => {
  const region = resolveRegion(inputs.marketplace);
  const cfg = REGION_CONFIG[region];

  const listingPrice = inputs.listingPrice ?? 25;
  const shippingCost = inputs.shippingCost ?? 7;
  const quantity = inputs.quantity ?? 1;
  const itemCost = inputs.itemCost ?? 8; // cost to make/source the item
  const shippingPaid = inputs.shippingPaid ?? 7; // what buyer pays for shipping

  const totalRevenue = (listingPrice + shippingPaid) * quantity;
  const totalItemCost = itemCost * quantity;

  // 1. Listing fee: a flat fee per item; region-flavoured flat fee → USD.
  const listingFee = cfg.listingFee * quantity * FX_TO_USD[region];

  // 2. Transaction fee: 6.5% worldwide, on the listing price only.
  const transactionFee = (listingPrice * 0.065) * quantity;

  // 3. Payment processing: region-specific percent + flat fee on total incl. shipping.
  //    The percent is applied to the USD order total; the flat fee is converted to USD.
  const paymentProcessingFee = (listingPrice + shippingPaid) * (cfg.processingPercent / 100) * quantity + cfg.processingFlat * FX_TO_USD[region];

  // 4. Offsite Ads fee (optional): 15% of the order total for ad-attributed sales
  //    below $10,000 in trailing 365-day sales, 12% at or above that threshold —
  //    where participation also becomes mandatory for the life of the shop.
  //    Capped at $100 USD per order per Etsy's policy.
  const offsiteRate = Number(inputs.offsiteAds) === 2 ? 0.12 : 0.15;
  const offsiteAdsFee = inputs.offsiteAds ? Math.min(totalRevenue * offsiteRate, 100) : 0;

  // 5. Shipping transaction fee: 6.5% on the shipping amount the buyer pays.
  const shippingTransactionFee = (shippingPaid * 0.065) * quantity;

  // 6. Regulatory operating fee: set by the country the shop is registered in,
  //    ranges from 0.05% to 1.97% of the order, and is not charged at all to
  //    US-registered shops. The rate is not uniform enough to assume, so the
  //    seller reads it off Etsy's published table and enters it; default 0.
  const regulatoryFee = totalRevenue * ((inputs.regulatoryFee ?? 0) / 100);

  const totalEtsyFees =
    listingFee + transactionFee + paymentProcessingFee + offsiteAdsFee + shippingTransactionFee + regulatoryFee;

  // Actual shipping cost to you.
  const actualShipping = shippingCost * quantity;

  // Net profit.
  const grossRevenue = totalRevenue;
  const totalCosts = totalItemCost + actualShipping + totalEtsyFees;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    summary: {
      grossRevenue: { label: 'Gross Revenue', value: Math.round(grossRevenue * 100) / 100, type: 'currency' },
      totalEtsyFees: { label: 'Total Etsy Fees', value: Math.round(totalEtsyFees * 100) / 100, type: 'currency' },
      itemCost: { label: 'Item Cost', value: Math.round(totalItemCost * 100) / 100, type: 'currency' },
      shippingCost: { label: 'Shipping Cost', value: Math.round(actualShipping * 100) / 100, type: 'currency' },
      netProfit: { label: 'Net Profit', value: Math.round(netProfit * 100) / 100, type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: Math.round(profitMargin * 10) / 10, type: 'percentage' },
    },
    chartData: [
      { name: 'Item Cost', value: Math.round(totalItemCost * 100) / 100 },
      { name: 'Etsy Fees', value: Math.round(totalEtsyFees * 100) / 100 },
      { name: 'Shipping', value: Math.round(actualShipping * 100) / 100 },
      { name: 'Net Profit', value: Math.round(netProfit * 100) / 100 },
    ],
  };
};