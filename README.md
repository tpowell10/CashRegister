# Cash Register

## The Problem
Creative Cash Draw Solutions is a client who wants to provide something different for the cashiers who use their system. The function of the application is to tell the cashier how much change is owed, and what denominations should be used. In most cases the app should return the minimum amount of physical change, but the client would like to add a twist. If the "owed" amount is divisible by 3, the app should randomly generate the change denominations (but the math still needs to be right :))

Please write a program which accomplishes the clients goals. The program should:

1. Accept a flat file as input
	1. Each line will contain the amount owed and the amount paid separated by a comma (for example: 2.13,3.00)
	2. Expect that there will be multiple lines
2. Output the change the cashier should return to the customer
	1. The return string should look like: 1 dollar,2 quarters,1 nickel, etc ...
	2. Each new line in the input file should be a new line in the output file

## Sample Input
2.12,3.00

1.97,2.00

3.33,5.00

## Sample Output
3 quarters,1 dime,3 pennies

3 pennies

1 dollar,1 quarter,6 nickels,12 pennies

*Remember the last one is random

## The Fine Print
Please use whatever technology and techniques you feel are applicable to solve the problem. We suggest that you approach this exercise as if this code was part of a larger system. The end result should be representative of your abilities and style.

Please fork this repository. When you have completed your solution, please issue a pull request to notify us that you are ready.

Have fun.

## Things To Consider
Here are a couple of thoughts about the domain that could influence your response:

* What might happen if the client needs to change the random divisor?
* What might happen if the client needs to add another special case (like the random twist)?
* What might happen if sales closes a new client in France?

---

# Solution

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Run all 90 tests
```

## Features

- **Web UI**: Interactive calculator + file upload with drag-and-drop
- **Standard Mode**: Returns minimum denominations using a greedy algorithm
- **Random Mode**: When change (in cents) is divisible by 3, randomizes denominations
- **Batch Processing**: Upload a file with multiple transactions
- **Extensible Design**: Easy to add new currencies or special calculation rules

## Architecture

```
src/
├── lib/                    # Core business logic
│   ├── calculator.ts       # Main calculation engine
│   ├── currencies.ts       # USD/EUR denomination definitions
│   ├── strategies.ts       # Calculation strategies (min, random)
│   ├── parser.ts           # Input parsing and validation
│   ├── errors.ts           # Custom error classes
│   └── types.ts            # TypeScript interfaces
├── app/
│   ├── api/calculate/      # API endpoint
│   └── page.tsx            # Main UI
└── components/             # React components
```

## Addressing "Things To Consider"

### 1. What if the client needs to change the random divisor?

The divisor is a configurable constant in `strategies.ts`:

```typescript
export const RANDOM_DIVISOR = 3;
```

Changing this single value updates the behavior everywhere.

### 2. What if the client needs to add another special case?

The calculation uses a **Strategy Pattern**. To add a new rule:

```typescript
// strategies.ts
export const myNewStrategy: CalculationStrategy = {
  name: 'myNewStrategy',
  shouldApply: (changeInCents) => /* your condition */,
  calculate: (changeInCents, denominations) => /* your logic */,
};

// Add to DEFAULT_STRATEGIES array (higher = more priority)
export const DEFAULT_STRATEGIES = [
  myNewStrategy,
  randomWhenDivisibleStrategy,
  minimumDenominationsStrategy,  // Fallback
];
```

### 3. What if sales closes a new client in France?

Currencies are abstracted in `currencies.ts`. EUR is already defined:

```typescript
import { EUR } from './currencies';

calculateChange(2.50, 5.00, { currency: EUR });
```

## Technical Decisions

### Floating Point Precision

All calculations are done in cents (integers) to avoid JavaScript floating point issues:

```typescript
// Bad: 0.1 + 0.2 = 0.30000000000000004
// Good: 10 + 20 = 30 (cents)
const changeInCents = dollarsToCents(paid) - dollarsToCents(owed);
```

### Error Handling

Custom error classes provide specific, actionable feedback:

- `InvalidInputError` - Malformed input with line numbers
- `InsufficientPaymentError` - Shows shortfall amount
- `NegativeAmountError` - Rejects negative values

## API

### POST /api/calculate

**Single calculation:**
```json
{ "amountOwed": 2.12, "amountPaid": 3.00 }
```

**Batch calculation:**
```json
{ "input": "2.12,3.00\n1.97,2.00" }
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest (90 tests)
