import { NextRequest, NextResponse } from 'next/server';
import { calculateChange, calculateBatch, formatBatchResults } from '@/lib/calculator';
import { InsufficientPaymentError, NegativeAmountError, InvalidInputError } from '@/lib/errors';

/**
 * API response type for consistent JSON structure
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * POST /api/calculate
 * 
 * Accepts either:
 * 1. Single calculation: { amountOwed: number, amountPaid: number }
 * 2. Batch calculation: { input: string } (file contents or multiple lines)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await request.json();

    // Check if it's a single calculation or batch
    if ('amountOwed' in body && 'amountPaid' in body) {
      // Single calculation mode
      const { amountOwed, amountPaid } = body;

      // Validate types
      if (typeof amountOwed !== 'number' || typeof amountPaid !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'amountOwed and amountPaid must be numbers',
              code: 'INVALID_INPUT',
            },
          },
          { status: 400 }
        );
      }

      const result = calculateChange(amountOwed, amountPaid);
      
      return NextResponse.json({
        success: true,
        data: {
          amountOwed: result.amountOwed,
          amountPaid: result.amountPaid,
          changeAmount: result.changeAmount,
          denominations: result.denominations.map(d => ({
            name: d.denomination.name,
            count: d.count,
            value: d.denomination.valueInCents,
          })),
          formatted: result.formatted,
          wasRandomized: result.wasRandomized,
          warning: result.warning,
        },
      });
    } else if ('input' in body) {
      // Batch calculation mode
      const { input } = body;

      if (typeof input !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'input must be a string',
              code: 'INVALID_INPUT',
            },
          },
          { status: 400 }
        );
      }

      const batchResult = calculateBatch(input);
      const formattedOutput = formatBatchResults(batchResult);

      return NextResponse.json({
        success: true,
        data: {
          results: batchResult.results.map(r => ({
            amountOwed: r.amountOwed,
            amountPaid: r.amountPaid,
            changeAmount: r.changeAmount,
            formatted: r.formatted,
            wasRandomized: r.wasRandomized,
            warning: r.warning,
          })),
          errors: batchResult.errors,
          formattedOutput,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Request must include either { amountOwed, amountPaid } or { input }',
            code: 'INVALID_REQUEST',
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Handle known error types
    if (error instanceof InsufficientPaymentError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'INSUFFICIENT_PAYMENT',
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof NegativeAmountError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'NEGATIVE_AMOUNT',
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof InvalidInputError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'INVALID_INPUT',
          },
        },
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON in request body',
            code: 'INVALID_JSON',
          },
        },
        { status: 400 }
      );
    }

    // Unknown error
    console.error('Unexpected error in /api/calculate:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}


