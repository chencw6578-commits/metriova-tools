# metriova-formulas

Pure TypeScript calculation formulas for finance, health and construction — zero dependencies, fully typed, unit-tested.

This is the calculation engine behind [Metriova](https://www.metriova.net)'s online calculators, extracted into a standalone library so the math is inspectable and reusable.

## What's inside

54 formulas across four domains:

| Domain | Examples |
|---|---|
| Finance | mortgage, auto loan, refinance, compound interest, credit card payoff, retirement (401k), rent vs. buy, inflation, sales tax, ROI, break-even |
| Marketplace fees | eBay, Etsy, Depop, Poshmark, Mercari, Vinted, Amazon FBA |
| Health | BMI, BMR, TDEE, body fat, ideal weight, heart rate zones, water intake, macro nutrients, pregnancy weight gain |
| Home & DIY | roofing, roof pitch, concrete, brick mortar, flooring tile, wall paint, deck material, mulch |

Every calculator follows the same interface:

```ts
type CalculationResult = {
  summary: Record<string, { label: string; value: number; type: ResultType }>;
  chartData?: ChartPoint[];
};

type FormulaFunction = (inputs: Record<string, number>) => CalculationResult;
```

No classes, no side effects, no I/O — pass a bag of numbers, get a bag of numbers back.

## Usage

```bash
npm install metriova-formulas
```

```ts
import { calculateMortgage, calculateBMI } from 'metriova-formulas';

const mortgage = calculateMortgage({
  homePrice: 300000,
  downPayment: 60000,
  loanTerm: 30,
  interestRate: 6,
});
console.log(mortgage.summary.monthlyPayment.value); // ≈ 1438.92

const bmi = calculateBMI({ weight: 70, height: 175 });
console.log(bmi.summary.bmi.value); // 22.9
```

Inputs not provided fall back to the same defaults used on metriova.net, so every function is safe to call with a partial input object.

## Development

```bash
npm install
npm test        # run the unit test suite
npm run build   # emit dist/ (ESM + declarations)
```

Tests verify the formulas against independently computed reference values (standard amortization, BMI definition, compound growth), not against the site's own output.

## Notes on accuracy

- Financial formulas use standard textbook definitions (e.g. fixed-rate amortization). They are for estimation and education, not financial advice.
- Health formulas use widely used population equations; individual results vary.
- Each formula documents its own assumptions in code comments where non-obvious.

## License

[MIT](./LICENSE)
