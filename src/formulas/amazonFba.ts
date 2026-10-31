import { CalculationResult } from '../types.js';

/**
 * Amazon FBA — multi-market profit calculator.
 *
 * De-localization fix: instead of copying the US calculation into every
 * language, the seller picks a marketplace (US / EU / Japan) and the fee
 * tables + weight units switch with it. Each market has its own fulfilment
 * fee table and its own weight unit (lbs for US, kg for EU/JP).
 *
 * Marketplace keys: 1 = United States, 2 = Europe (Germany proxy), 3 = Japan.
 */
type Market = 'us' | 'eu' | 'jp';

function resolveMarket(v?: number): Market {
  const m = Number(v);
  if (m === 2) return 'eu';
  if (m === 3) return 'jp';
  return 'us';
}

// Static FX to USD (approximate Aug 2026 monthly averages; Fed G.5). The fee
// tables below are quoted in EUR (EU) and JPY (Japan), while the price and cost
// inputs are entered in US dollars, so fulfilment fees are converted to USD.
const EUR_TO_USD = 1.16;
const JPY_TO_USD = 0.0063; // ≈ 1 / 158.7 (yen per USD)

/**
 * US 2026 non-peak FBA fulfilment fee (per unit, non-apparel).
 * productWeight is in pounds; sizeTier 1 = standard, 2 = oversize.
 *
 * Returns the BASE fee — the fuel & logistics surcharge is applied one level up
 * in usFulfillmentFee(), so this stays a clean rate-card lookup.
 */
function usFulfillmentFeeBase(inputs: Record<string, number>): number {
  const productWeight = inputs.productWeight ?? 1; // lbs
  const productSize = inputs.productSize ?? 1;

  const packagingWeight = productSize === 2 ? 1 : 0.25; // lb
  const shippingWeight = productWeight + packagingWeight;

  type PriceTier = 'low' | 'mid' | 'high';
  let priceTier: PriceTier;
  const price = inputs.productPrice ?? 25;
  if (price < 10) {
    priceTier = 'low';
  } else if (price <= 50) {
    priceTier = 'mid';
  } else {
    priceTier = 'high';
  }

  if (productSize === 2) {
    const heavyBaseFee = priceTier === 'low' ? 6.78 : 7.55;
    if (shippingWeight <= 1) return heavyBaseFee;
    return heavyBaseFee + Math.ceil(shippingWeight - 1) * 0.38;
  }

  const rateTable: Record<PriceTier, number[]> = {
    low: [2.91, 3.13, 3.38, 3.78, 4.22, 4.60, 4.75, 5.00, 5.10, 5.28, 5.44, 5.85],
    mid: [3.73, 3.95, 4.20, 4.60, 5.04, 5.42, 5.57, 5.82, 5.92, 6.10, 6.26, 6.67],
    high: [3.99, 4.21, 4.46, 4.86, 5.30, 5.68, 5.83, 6.08, 6.18, 6.36, 6.52, 6.93],
  };
  const rates = rateTable[priceTier];

  if (shippingWeight <= 0.25) return rates[0];
  if (shippingWeight <= 0.5) return rates[1];
  if (shippingWeight <= 0.75) return rates[2];
  if (shippingWeight <= 1) return rates[3];
  if (shippingWeight <= 1.25) return rates[4];
  if (shippingWeight <= 1.5) return rates[5];
  if (shippingWeight <= 1.75) return rates[6];
  if (shippingWeight <= 2) return rates[7];
  if (shippingWeight <= 2.25) return rates[8];
  if (shippingWeight <= 2.5) return rates[9];
  if (shippingWeight <= 2.75) return rates[10];
  if (shippingWeight <= 3) return rates[11];

  const overThreeBase: Record<PriceTier, number> = { low: 6.15, mid: 6.97, high: 7.23 };
  const additionalOz = (shippingWeight - 3) * 16;
  const additionalFourOzIncrements = Math.ceil(additionalOz / 4);
  return overThreeBase[priceTier] + additionalFourOzIncrements * 0.08;
}

/**
 * Fuel & logistics surcharge on US FBA fulfilment fees, effective 2026-04-17.
 *
 * Why this exists: every calculator ranking for "amazon fba calculator 2026"
 * includes it (revenuegeeks, sellerplex, calculatorsphere, profitvana,
 * sellergains — all five, verified by SERP check on 2026-10-10). Omitting it
 * under-states the fulfilment fee by ~3.5%, which is enough for a seller's
 * calculated margin to disagree with their real Seller Central payout — the
 * fastest way to lose a user permanently.
 *
 * US only: this surcharge is documented for the US marketplace. The EU and JP
 * rate cards are published separately and we have NOT verified an equivalent,
 * so they are deliberately left untouched rather than guessed at.
 */
const US_FUEL_SURCHARGE_RATE = 0.035; // 3.5%, effective 2026-04-17

function usFulfillmentFee(inputs: Record<string, number>): number {
  return usFulfillmentFeeBase(inputs) * (1 + US_FUEL_SURCHARGE_RATE);
}

/**
 * Europe (Germany proxy) — 2026 FBA standard-parcel non-peak rates, CEP zone.
 * productWeight is in kilograms. Packaging adds ~0.1 kg (a small standard parcel).
 * Weights above the last tier fall back to the ≤5.9 kg rate as an approximation.
 */
function euFulfillmentFee(inputs: Record<string, number>): number {
  const shippingKg = (inputs.productWeight ?? 1) + 0.1; // kg
  const oversize = (inputs.productSize ?? 1) === 2;

  if (oversize) {
    // Simplified oversize estimate (EU oversized parcels run well above standard).
    return 7.75 + Math.max(0, shippingKg - 3) * 0.4;
  }

  // Standard parcel (≤45×34×26 cm), CEP (DE/PL/CZ) column, 2026 non-peak.
  const tiers: Array<[number, number]> = [
    [0.15, 3.13],
    [0.4, 3.16],
    [0.9, 3.18],
    [1.4, 3.67],
    [1.9, 3.69],
    [2.9, 4.29],
    [3.9, 4.83],
    [5.9, 4.96],
  ];
  // tiers are [maxKg, fee] ascending, so scan FORWARD and return the first
  // band the parcel fits into. Scanning backward (the previous behaviour)
  // matched the 5.9 kg band first for any parcel under 5.9 kg and returned
  // €4.96 for everything — a 1.1 kg parcel was billed at the 5.9 kg rate,
  // overstating the EU fee by ~35%.
  for (let i = 0; i < tiers.length; i++) {
    if (shippingKg <= tiers[i][0]) return tiers[i][1];
  }
  return 4.96; // > 5.9 kg — cap (not published on the non-peak parcel card)
}

/**
 * Japan — 2026 FBA rates (Amazon.co.jp), items priced above ¥1,000, non-frozen.
 * Verified 2026-10 against the official Seller Central rate card effective
 * 2026-04-01 (items > ¥1,000: Small 288 / Std-1 318 / Std-2a–e 410–430 /
 * Std-3 472 / Std-4 532 / Oversize 624–1,020 JPY — all match the values below).
 * productWeight is in kilograms. Size tier maps to the closest weight band.
 */
function jpFulfillmentFee(inputs: Record<string, number>): number {
  const shippingKg = (inputs.productWeight ?? 1) + 0.1; // kg (incl. packaging)
  const oversize = (inputs.productSize ?? 1) === 2;

  if (oversize) {
    if (shippingKg <= 5) return 624; // Oversize-80 cm
    if (shippingKg <= 10) return 675; // Oversize-100 cm
    if (shippingKg <= 15) return 781; // Oversize-120 cm
    return 1020; // Oversize-140 cm
  }

  if (shippingKg <= 0.25) return 288; // Small
  if (shippingKg <= 1) return 318; // Standard-1

  // Standard-2 (≤2 kg): fee varies by longest-side band — Amazon.co.jp 2026 rate card.
  if (shippingKg <= 2) {
    const bands: Record<number, number> = { 20: 410, 30: 415, 40: 420, 50: 425, 60: 430 };
    return bands[inputs.jpStdSizeCm ?? 20] ?? bands[20];
  }

  if (shippingKg <= 5) return 472; // Standard-3 (80 cm)
  return 532; // Standard-4 (100 cm, 9 kg)
}

export const calculateAmazonFba = (inputs: Record<string, number>): CalculationResult => {
  const market = resolveMarket(inputs.marketplace);

  const productPrice = inputs.productPrice ?? 25;
  const productCost = inputs.productCost ?? 8;
  const shippingToAmazon = inputs.shippingToAmazon ?? 2; // per unit inbound shipping
  const prepCost = inputs.prepCost ?? 0.5; // labeling / prep per unit
  const storageFee = inputs.storageFee ?? 0;

  // Amazon referral fee (% of the sale price) — most categories are 8-15%.
  const referralFeePercent = inputs.referralFeePercent ?? 15;
  const referralFee = productPrice * (referralFeePercent / 100);

  let fulfillmentFee: number;
  if (market === 'eu') {
    fulfillmentFee = euFulfillmentFee(inputs) * EUR_TO_USD;
  } else if (market === 'jp') {
    fulfillmentFee = jpFulfillmentFee(inputs) * JPY_TO_USD;
  } else {
    fulfillmentFee = usFulfillmentFee(inputs);
  }

  const totalAmazonFees = referralFee + fulfillmentFee + storageFee;
  const totalCosts = productCost + shippingToAmazon + prepCost + totalAmazonFees;
  const profitPerUnit = productPrice - totalCosts;
  const profitMargin = productPrice > 0 ? (profitPerUnit / productPrice) * 100 : 0;
  const roi = totalCosts > 0 ? (profitPerUnit / totalCosts) * 100 : 0;

  // Surface the surcharge in the label so the number is auditable — a seller
  // who sees "3.5% fuel" can reconcile our fee against their own payout.
  const fulfillmentLabel =
    market === 'us' ? 'FBA Fulfillment Fee (incl. 3.5% fuel)' : 'FBA Fulfillment Fee';

  return {
    summary: {
      productPrice: { label: 'Selling Price', value: Math.round(productPrice * 100) / 100, type: 'currency' },
      referralFee: { label: 'Referral Fee', value: Math.round(referralFee * 100) / 100, type: 'currency' },
      fulfillmentFee: { label: fulfillmentLabel, value: Math.round(fulfillmentFee * 100) / 100, type: 'currency' },
      totalAmazonFees: { label: 'Total Amazon Fees', value: Math.round(totalAmazonFees * 100) / 100, type: 'currency' },
      totalCosts: { label: 'Total Cost per Unit', value: Math.round(totalCosts * 100) / 100, type: 'currency' },
      profitPerUnit: { label: 'Profit per Unit', value: Math.round(profitPerUnit * 100) / 100, type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: Math.round(profitMargin * 10) / 10, type: 'percentage' },
      roi: { label: 'ROI (%)', value: Math.round(roi * 10) / 10, type: 'percentage' },
    },
    chartData: [
      { name: 'Product Cost', value: Math.round(productCost * 100) / 100 },
      { name: 'Shipping & Prep', value: Math.round((shippingToAmazon + prepCost) * 100) / 100 },
      { name: 'Referral Fee', value: Math.round(referralFee * 100) / 100 },
      { name: 'Fulfillment Fee', value: Math.round(fulfillmentFee * 100) / 100 },
      { name: 'Profit', value: Math.round(profitPerUnit * 100) / 100 },
    ],
  };
};