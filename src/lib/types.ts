/**
 * Represents a single denomination (coin or bill)
 */
export interface Denomination {
  name: string;
  /** Singular name for display (e.g., "penny") */
  singular: string;
  /** Plural name for display (e.g., "pennies") */
  plural: string;
  /** Value in cents */
  valueInCents: number;
}

/**
 * Currency configuration
 */
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  /** Denominations sorted from highest to lowest value */
  denominations: Denomination[];
}

/**
 * Result of a change calculation for a single denomination
 */
export interface DenominationResult {
  denomination: Denomination;
  count: number;
}

/**
 * Result of calculating change for a single transaction
 */
export interface ChangeResult {
  /** Original amount owed in dollars */
  amountOwed: number;
  /** Original amount paid in dollars */
  amountPaid: number;
  /** Change amount in dollars */
  changeAmount: number;
  /** Change amount in cents (for precision) */
  changeInCents: number;
  /** Breakdown of denominations */
  denominations: DenominationResult[];
  /** Whether random mode was used */
  wasRandomized: boolean;
  /** Formatted output string */
  formatted: string;
  /** Warning message if applicable */
  warning?: string;
}

/**
 * Result of parsing a single line of input
 */
export interface ParsedLine {
  lineNumber: number;
  amountOwed: number;
  amountPaid: number;
  raw: string;
}

/**
 * Result of processing a batch of transactions
 */
export interface BatchResult {
  results: ChangeResult[];
  errors: BatchError[];
}

/**
 * Error from batch processing
 */
export interface BatchError {
  lineNumber: number;
  message: string;
  raw: string;
}

/**
 * Context passed to strategy for decision making
 */
export interface StrategyContext {
  owedInCents: number;
  paidInCents: number;
  changeInCents: number;
}

/**
 * Strategy for determining if special calculation should be used
 */
export interface CalculationStrategy {
  name: string;
  /** Check if this strategy should be applied */
  shouldApply: (context: StrategyContext) => boolean;
  /** Calculate denominations using this strategy */
  calculate: (changeInCents: number, denominations: Denomination[]) => DenominationResult[];
}

