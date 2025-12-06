/**
 * Base class for Cash Register errors
 */
export class CashRegisterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CashRegisterError';
    Object.setPrototypeOf(this, CashRegisterError.prototype);
  }
}

/**
 * Thrown when input format is invalid
 */
export class InvalidInputError extends CashRegisterError {
  lineNumber?: number;
  raw?: string;

  constructor(message: string, lineNumber?: number, raw?: string) {
    const fullMessage = lineNumber !== undefined
      ? `Line ${lineNumber}: ${message}`
      : message;
    super(fullMessage);
    this.name = 'InvalidInputError';
    this.lineNumber = lineNumber;
    this.raw = raw;
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
}

/**
 * Thrown when payment is less than amount owed
 */
export class InsufficientPaymentError extends CashRegisterError {
  amountOwed: number;
  amountPaid: number;
  shortfall: number;

  constructor(amountOwed: number, amountPaid: number) {
    const shortfall = amountOwed - amountPaid;
    super(
      `Insufficient payment: paid $${amountPaid.toFixed(2)} but owed $${amountOwed.toFixed(2)}. ` +
      `Short by $${shortfall.toFixed(2)}.`
    );
    this.name = 'InsufficientPaymentError';
    this.amountOwed = amountOwed;
    this.amountPaid = amountPaid;
    this.shortfall = shortfall;
    Object.setPrototypeOf(this, InsufficientPaymentError.prototype);
  }
}

/**
 * Thrown when amount is negative
 */
export class NegativeAmountError extends CashRegisterError {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'NegativeAmountError';
    Object.setPrototypeOf(this, NegativeAmountError.prototype);
  }
}


