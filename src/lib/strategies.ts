import { CalculationStrategy, Denomination, DenominationResult, StrategyContext } from './types';

/**
 * Configurable divisor for random mode
 * Can be easily changed if client requirements change
 */
export const RANDOM_DIVISOR = 3;

/**
 * Calculates minimum denominations using greedy algorithm
 * This is the default/standard calculation method
 */
export function calculateMinimumDenominations(
  changeInCents: number,
  denominations: Denomination[]
): DenominationResult[] {
  const results: DenominationResult[] = [];
  let remaining = changeInCents;

  for (const denom of denominations) {
    if (remaining >= denom.valueInCents) {
      const count = Math.floor(remaining / denom.valueInCents);
      remaining = remaining % denom.valueInCents;
      results.push({ denomination: denom, count });
    }
  }

  return results;
}

/**
 * Calculates random (but valid) denominations
 * Used when change amount is divisible by the configured divisor
 */
export function calculateRandomDenominations(
  changeInCents: number,
  denominations: Denomination[]
): DenominationResult[] {
  const results: DenominationResult[] = [];
  let remaining = changeInCents;

  // Shuffle denominations for randomness, but keep penny last to ensure we can always make exact change
  const pennyDenom = denominations.find(d => d.valueInCents === 1);
  const otherDenoms = denominations.filter(d => d.valueInCents !== 1);
  
  // Fisher-Yates shuffle for other denominations
  const shuffled = [...otherDenoms];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Process shuffled denominations with random counts
  for (const denom of shuffled) {
    if (remaining >= denom.valueInCents) {
      const maxCount = Math.floor(remaining / denom.valueInCents);
      // Use random count between 0 and maxCount
      const count = Math.floor(Math.random() * (maxCount + 1));
      if (count > 0) {
        remaining -= count * denom.valueInCents;
        results.push({ denomination: denom, count });
      }
    }
  }

  // Use pennies for whatever is left (guarantees correct total)
  if (remaining > 0 && pennyDenom) {
    results.push({ denomination: pennyDenom, count: remaining });
  }

  // Sort results by denomination value (highest first) for consistent output
  return results.sort((a, b) => b.denomination.valueInCents - a.denomination.valueInCents);
}

/**
 * Default strategy: Use random denominations when OWED amount is divisible by RANDOM_DIVISOR
 * Per README: "If the owed amount is divisible by 3, the app should randomly generate the change"
 */
export const randomWhenDivisibleStrategy: CalculationStrategy = {
  name: 'randomWhenDivisible',
  shouldApply: (context: StrategyContext) => {
    // Check if OWED amount (not change) is divisible by divisor
    return context.changeInCents > 0 && context.owedInCents % RANDOM_DIVISOR === 0;
  },
  calculate: calculateRandomDenominations,
};

/**
 * Minimum denominations strategy (standard greedy algorithm)
 */
export const minimumDenominationsStrategy: CalculationStrategy = {
  name: 'minimumDenominations',
  shouldApply: () => true, // Always applicable as fallback
  calculate: calculateMinimumDenominations,
};

/**
 * Default strategies in order of priority
 * First matching strategy will be used
 */
export const DEFAULT_STRATEGIES: CalculationStrategy[] = [
  randomWhenDivisibleStrategy,
  minimumDenominationsStrategy,
];

