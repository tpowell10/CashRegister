import { ParsedLine, BatchError } from './types';
import { InvalidInputError } from './errors';

/**
 * Parses a monetary amount string, handling various formats
 * - Strips currency symbols ($, €)
 * - Handles commas in numbers
 * - Rounds to 2 decimal places if more precision given
 */
export function parseAmount(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.trim().replace(/[$€£¥]/g, '').replace(/,/g, '');
  
  // Check for empty string after cleaning
  if (!cleaned) {
    throw new InvalidInputError('Empty amount value');
  }

  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new InvalidInputError(`Invalid number: "${value}"`);
  }

  if (!isFinite(parsed)) {
    throw new InvalidInputError(`Invalid number (infinity): "${value}"`);
  }

  if (parsed < 0) {
    throw new InvalidInputError(`Amount cannot be negative: "${value}"`);
  }

  // Round to 2 decimal places to handle floating point precision
  return Math.round(parsed * 100) / 100;
}

/**
 * Parses a single line of input in format "owed,paid"
 */
export function parseLine(line: string, lineNumber: number): ParsedLine {
  const trimmed = line.trim();
  
  if (!trimmed) {
    throw new InvalidInputError('Empty line', lineNumber, line);
  }

  // Split by comma
  const parts = trimmed.split(',');
  
  if (parts.length < 2) {
    throw new InvalidInputError(
      'Invalid format. Expected "amount_owed,amount_paid" (e.g., "2.13,3.00")',
      lineNumber,
      line
    );
  }

  // Take first two values, ignore any extras
  const [owedStr, paidStr] = parts;

  try {
    const amountOwed = parseAmount(owedStr);
    const amountPaid = parseAmount(paidStr);

    return {
      lineNumber,
      amountOwed,
      amountPaid,
      raw: line,
    };
  } catch (error) {
    if (error instanceof InvalidInputError) {
      throw new InvalidInputError(error.message, lineNumber, line);
    }
    throw error;
  }
}

/**
 * Parses multiple lines of input (file contents or textarea)
 * Returns successful parses and collects errors separately
 */
export function parseInput(input: string): { parsed: ParsedLine[]; errors: BatchError[] } {
  const lines = input.split(/\r?\n/); // Handle both Unix and Windows line endings
  const parsed: ParsedLine[] = [];
  const errors: BatchError[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    try {
      parsed.push(parseLine(line, lineNumber));
    } catch (error) {
      if (error instanceof InvalidInputError) {
        errors.push({
          lineNumber,
          message: error.message,
          raw: line,
        });
      } else {
        errors.push({
          lineNumber,
          message: 'Unknown error parsing line',
          raw: line,
        });
      }
    }
  });

  return { parsed, errors };
}

/**
 * Converts dollars to cents (avoids floating point issues)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Converts cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

