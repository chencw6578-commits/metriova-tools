import { CalculationResult } from '../types';

/**
 * eBay — US-market final value fee & profit calculator.
 *
 * Rates verified against eBay's published US fee schedule (ebay.com/help
 * "Selling fees"), July 2026. Final value fee = percentage of the total sale
 * (item price + buyer shipping + seller sales tax) up to a cap, beyond which a
 * lower rate applies. Store subscribers and Top Rated Plus sellers get
 * reduced/discounted rates; promoted listings and international sales add fees.
 *
 * Category keys: 1..11 match the select options in calculators.ts.
 * Store keys:    0 = No Store, 1 = Starter, 2 = Basic and above.
 */
type CategoryKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

interface CategoryRates {
  percent: number;   // final value fee % (no Store)
  percentBase: number; // % with a Basic Store or above
  cap: number;       // amount up to which `percent` applies before the low rate
  lowPercent: number;
  storeLowPercent?: number; // low rate beyond `cap` for Basic Store+ (defaults to lowPercent)
  noPerOrder?: boolean; // category exempt from the per-order fee (eBay: Sneakers $150+)
  minPrice?: number;  // threshold price; below it the category's special rate does not apply
}

// Rate profile used when a special-rate category doesn't meet its threshold
// (e.g. athletic shoes under $150 fall back to the standard rate).
const MOST_CATEGORIES: CategoryRates = { percent: 13.6, percentBase: 12.7, cap: 7500, lowPercent: 2.35 };

// Rates reflect eBay's July 2026 US selling-fee schedule by category.
const CATEGORY_RATES: Record<CategoryKey, CategoryRates> = {
  1:  { percent: 13.6, percentBase: 12.7, cap: 7500, lowPercent: 2.35 }, // Most categories
  2:  { percent: 15.3, percentBase: 15.3, cap: 7500, lowPercent: 2.35 }, // Books, movies & music
  3:  { percent: 13.6, percentBase: 9.35, cap: 7500, lowPercent: 2.35 }, // Consumer electronics
  4:  { percent: 13.25, percentBase: 12.35, cap: 7500, lowPercent: 2.35 }, // Trading cards
  5:  { percent: 13.25, percentBase: 12.35, cap: 7500, lowPercent: 2.35 }, // Coins & paper money
  6:  { percent: 15, percentBase: 13, cap: 5000, lowPercent: 9, storeLowPercent: 7 },   // Jewelry (except watches)
  7:  { percent: 15, percentBase: 12.5, cap: 1000, lowPercent: 6.5, storeLowPercent: 4 },   // Watches (tiered)
  8:  { percent: 15, percentBase: 13, cap: 2000, lowPercent: 9, storeLowPercent: 7 },   // Women's bags & handbags
  9:  { percent: 8, percentBase: 7, cap: 0, lowPercent: 8, noPerOrder: true, minPrice: 150 }, // Athletic shoes $150+
  10: { percent: 6.7, percentBase: 6.7, cap: 7500, lowPercent: 2.35 },  // Guitars & basses
  11: { percent: 13.6, percentBase: 13.6, cap: 7500, lowPercent: 2.35 }, // Video games
};

const PER_ORDER: Record<number, { over10: number; upTo10: number }> = {
  0: { over10: 0.4, upTo10: 0.3 },  // No Store
  1: { over10: 0.35, upTo10: 0.25 }, // Starter Store
  2: { over10: 0.35, upTo10: 0.25 }, // Basic Store and above
};

/** Applies the category rate, Top Rated Plus 10% discount, and low-rate above cap. */
function finalValueFeePercent(cat: CategoryRates, storeLevel: number, topRated: number): number {
  let base = storeLevel >= 2 ? cat.percentBase : cat.percent;
  if (topRated) base *= 0.9; // Top Rated Plus = 10% off the percentage portion
  return base;
}

interface FeeCtx {
  cat: CategoryRates;
  storeLevel: number;
  topRated: number;
  promotedRate: number;
  international: number;
  buyerShipping: number;
  itemCost: number;
  shippingLabel: number;
}

interface FeeBreakdown {
  totalSale: number;
  fvfPercent: number;
  finalValueFee: number;
  perOrder: number;
  promotedFee: number;
  internationalFee: number;
  totalEbayFees: number;
}

/**
 * Computes every fee for a given sale price. The fees depend on the sale price
 * itself (final value fee, promoted, international), so this is reused both for
 * the entered price and while solving for the break-even price.
 */
function computeFees(salePrice: number, ctx: FeeCtx): FeeBreakdown {
  const totalSale = salePrice + ctx.buyerShipping;
  const store = ctx.storeLevel >= 2;

  // Special-rate categories with a threshold (e.g. athletic shoes ≥ $150) fall
  // back to the standard most-categories rate (and pay the per-order fee) when
  // the sale is below that threshold.
  const belowThreshold = ctx.cat.minPrice !== undefined && totalSale < ctx.cat.minPrice;
  const cat = belowThreshold ? MOST_CATEGORIES : ctx.cat;
  const noPerOrder = cat.noPerOrder;

  const fvfPercent = finalValueFeePercent(cat, ctx.storeLevel, ctx.topRated);

  let finalValueFee: number;
  if (cat.cap === 0) {
    // Flat-rate category (athletic shoes $150+): use the store-aware percent.
    finalValueFee = totalSale * (fvfPercent / 100);
  } else {
    const capped = Math.min(totalSale, store ? Math.min(cat.cap, 2500) : cat.cap);
    const belowCapFvf = capped * (fvfPercent / 100);
    const lowPercent = store ? (cat.storeLowPercent ?? cat.lowPercent) : cat.lowPercent;
    const aboveCap = totalSale > capped ? (totalSale - capped) * (lowPercent / 100) : 0;
    finalValueFee = belowCapFvf + aboveCap;
  }

  const perOrder = noPerOrder
    ? 0
    : totalSale <= 10
      ? PER_ORDER[ctx.storeLevel >= 1 ? 1 : 0].upTo10
      : PER_ORDER[ctx.storeLevel >= 1 ? 1 : 0].over10;

  const promotedFee = totalSale * (ctx.promotedRate / 100);
  const internationalFee = ctx.international ? totalSale * 0.0165 : 0;

  return {
    totalSale,
    fvfPercent,
    finalValueFee,
    perOrder,
    promotedFee,
    internationalFee,
    totalEbayFees: finalValueFee + perOrder + promotedFee + internationalFee,
  };
}

function netProfitAt(salePrice: number, ctx: FeeCtx): number {
  const f = computeFees(salePrice, ctx);
  return f.totalSale - f.totalEbayFees - ctx.itemCost - ctx.shippingLabel;
}

/**
 * Break-even sale price: the lowest price at which net profit = 0. Because the
 * fees grow with price, this is a fixed point — not the fees of the entered
 * price — so it is solved by bisection over the (monotone) net-profit curve.
 */
function findBreakeven(ctx: FeeCtx): number {
  let lo = 0;
  let hi = 1;
  while (netProfitAt(hi, ctx) < 0) hi *= 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (netProfitAt(mid, ctx) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export const calculateEbayFee = (inputs: Record<string, number>): CalculationResult => {
  const category = (inputs.category ?? 1) as CategoryKey;
  const storeLevel = inputs.storeLevel ?? 0;
  const cat = CATEGORY_RATES[category];

  const salePrice = inputs.salePrice ?? 45;
  const buyerShipping = inputs.buyerShipping ?? 0;
  const itemCost = inputs.itemCost ?? 15;
  const shippingLabel = inputs.shippingLabel ?? 6;
  const promotedRate = inputs.promotedRate ?? 0;
  const topRated = inputs.topRated ?? 0;
  const international = inputs.international ?? 0;

  const ctx: FeeCtx = {
    cat, storeLevel, topRated, promotedRate, international, buyerShipping, itemCost, shippingLabel,
  };

  // Display figures reflect the fees at the user's entered sale price.
  const f = computeFees(salePrice, ctx);

  const totalCosts = itemCost + shippingLabel + f.totalEbayFees;
  const netProfit = f.totalSale - totalCosts;
  const profitMargin = f.totalSale > 0 ? (netProfit / f.totalSale) * 100 : 0;
  const breakeven = findBreakeven(ctx);

  return {
    summary: {
      totalSale: { label: 'Total Sale', value: Math.round(f.totalSale * 100) / 100, type: 'currency' },
      totalFees: { label: 'Total eBay Fees', value: Math.round(f.totalEbayFees * 100) / 100, type: 'currency' },
      itemCost: { label: 'Item Cost', value: Math.round(itemCost * 100) / 100, type: 'currency' },
      shippingLabel: { label: 'Shipping Label', value: Math.round(shippingLabel * 100) / 100, type: 'currency' },
      netProfit: { label: 'Net Profit', value: Math.round(netProfit * 100) / 100, type: 'currency' },
      profitMargin: { label: 'Profit Margin (%)', value: Math.round(profitMargin * 10) / 10, type: 'percentage' },
    },
    chartData: [
      { name: 'Item Cost', value: Math.round(itemCost * 100) / 100 },
      { name: 'eBay Fees', value: Math.round(f.totalEbayFees * 100) / 100 },
      { name: 'Shipping Label', value: Math.round(shippingLabel * 100) / 100 },
      { name: 'Net Profit', value: Math.round(netProfit * 100) / 100 },
    ],
    extraData: {
      finalValueFee: { label: 'Final Value Fee', value: Math.round(f.finalValueFee * 100) / 100, type: 'currency' as const },
      perOrderFee: { label: 'Per-Order Fee', value: Math.round(f.perOrder * 100) / 100, type: 'currency' as const },
      promotedFee: { label: 'Advertised Fee', value: Math.round(f.promotedFee * 100) / 100, type: 'currency' as const },
      internationalFee: { label: 'International Fee', value: Math.round(f.internationalFee * 100) / 100, type: 'currency' as const },
      breakeven: { label: 'Break-even Price', value: Math.round(breakeven * 100) / 100, type: 'currency' as const },
      fvfRate: { label: 'Applied FVF Rate', value: Math.round(f.fvfPercent * 100) / 100, type: 'percentage' as const },
    },
  };
};