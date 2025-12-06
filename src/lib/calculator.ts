import { 
  ChangeResult, 
  DenominationResult, 
  Currency, 
  CalculationStrategy,
  BatchResult,
  StrategyContext
} from './types';
import { DEFAULT_CURRENCY } from './currencies';
import { DEFAULT_STRATEGIES, calculateMinimumDenominations } from './strategies';
import { InsufficientPaymentError, NegativeAmountError } from './errors';
import { dollarsToCents, parseInput } from './parser';

/**
 * Warning threshold for large overpayment (in cents)
 * Triggers a warning if change >= $100
 */
const LARGE_OVERPAYMENT_THRESHOLD_CENTS = 10000;

/**
 * Formats denomination results into a human-readable string
 * e.g., "3 quarters,1 dime,3 pennies"
 */
export function formatDenominations(results: DenominationResult[]): string {
  if (results.length === 0) {
    return 'No change';
  }

  return results
    .filter(r => r.count > 0)
    .map(r => {
      const name = r.count === 1 ? r.denomination.singular : r.denomination.plural;
      return `${r.count} ${name}`;
    })
    .join(',');
}

/**
 * Calculates change for a single transaction
 */
export function calculateChange(
  amountOwed: number,
  amountPaid: number,
  options: {
    currency?: Currency;
    strategies?: CalculationStrategy[];
  } = {}
): ChangeResult {
  const { 
    currency = DEFAULT_CURRENCY,
    strategies = DEFAULT_STRATEGIES 
  } = options;

  // Validate inputs
  if (amountOwed < 0) {
    throw new NegativeAmountError('Amount owed', amountOwed);
  }
  if (amountPaid < 0) {
    throw new NegativeAmountError('Amount paid', amountPaid);
  }

  // Convert to cents for precision
  const owedCents = dollarsToCents(amountOwed);
  const paidCents = dollarsToCents(amountPaid);
  const changeInCents = paidCents - owedCents;

  // Check for insufficient payment
  if (changeInCents < 0) {
    throw new InsufficientPaymentError(amountOwed, amountPaid);
  }

  // Check for exact payment (no change)
  if (changeInCents === 0) {
    return {
      amountOwed,
      amountPaid,
      changeAmount: 0,
      changeInCents: 0,
      denominations: [],
      wasRandomized: false,
      formatted: 'No change',
    };
  }

  // Check for large overpayment warning
  let warning: string | undefined;
  if (changeInCents >= LARGE_OVERPAYMENT_THRESHOLD_CENTS) {
    warning = `Large change amount: $${(changeInCents / 100).toFixed(2)}. Please verify this is correct.`;
  }

  // Build context for strategy decision
  const context: StrategyContext = {
    owedInCents: owedCents,
    paidInCents: paidCents,
    changeInCents,
  };

  // Find applicable strategy
  let denominations: DenominationResult[];
  let wasRandomized = false;

  for (const strategy of strategies) {
    if (strategy.shouldApply(context)) {
      denominations = strategy.calculate(changeInCents, currency.denominations);
      wasRandomized = strategy.name === 'randomWhenDivisible';
      break;
    }
  }

  // Fallback to minimum denominations if no strategy matched
  if (!denominations!) {
    denominations = calculateMinimumDenominations(changeInCents, currency.denominations);
  }

  return {
    amountOwed,
    amountPaid,
    changeAmount: changeInCents / 100,
    changeInCents,
    denominations,
    wasRandomized,
    formatted: formatDenominations(denominations),
    warning,
  };
}

/**
 * Processes multiple transactions from input string
 */
export function calculateBatch(
  input: string,
  options: {
    currency?: Currency;
    strategies?: CalculationStrategy[];
  } = {}
): BatchResult {
  const { parsed, errors } = parseInput(input);
  const results: ChangeResult[] = [];

  for (const line of parsed) {
    try {
      const result = calculateChange(line.amountOwed, line.amountPaid, options);
      results.push(result);
    } catch (error) {
      if (error instanceof InsufficientPaymentError) {
        errors.push({
          lineNumber: line.lineNumber,
          message: error.message,
          raw: line.raw,
        });
      } else if (error instanceof NegativeAmountError) {
        errors.push({
          lineNumber: line.lineNumber,
          message: error.message,
          raw: line.raw,
        });
      } else {
        errors.push({
          lineNumber: line.lineNumber,
          message: 'Unknown error calculating change',
          raw: line.raw,
        });
      }
    }
  }

  return { results, errors };
}

/**
 * Formats batch results for output (matching expected file format)
 */
export function formatBatchResults(batchResult: BatchResult): string {
  return batchResult.results.map(r => r.formatted).join('\n');
}

