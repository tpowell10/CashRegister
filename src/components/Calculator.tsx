'use client';

import { useState } from 'react';
import { ChangeVisual } from './ChangeVisual';

interface CalculationResult {
  amountOwed: number;
  amountPaid: number;
  changeAmount: number;
  formatted: string;
  wasRandomized: boolean;
  warning?: string;
  denominations: Array<{
    name: string;
    count: number;
    value: number;
  }>;
}

export function Calculator() {
  const [amountOwed, setAmountOwed] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Format currency input: only allow digits and max 2 decimal places
  const formatCurrencyInput = (value: string): string => {
    // Remove non-numeric characters except decimal point
    let cleaned = value.replace(/[^0-9.]/g, '');

    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }

    return cleaned;
  };

  const handleAmountChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(formatCurrencyInput(value));
  };

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    const owed = parseFloat(amountOwed);
    const paid = parseFloat(amountPaid);

    if (isNaN(owed) || isNaN(paid)) {
      setError('Please enter valid numbers');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountOwed: owed, amountPaid: paid }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'An error occurred');
        return;
      }

      setResult(data.data);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amountOwed" className="block text-sm font-medium text-gray-700 mb-2">
            Amount Owed
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              id="amountOwed"
              type="text"
              inputMode="decimal"
              value={amountOwed}
              onChange={(e) => handleAmountChange(e.target.value, setAmountOwed)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg 
                         focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         transition-all duration-200 outline-none
                         text-gray-900 placeholder-gray-400"
              aria-describedby="amountOwed-hint"
            />
          </div>
          <p id="amountOwed-hint" className="mt-1 text-xs text-gray-500">
            The total amount the customer owes
          </p>
        </div>

        <div>
          <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              id="amountPaid"
              type="text"
              inputMode="decimal"
              value={amountPaid}
              onChange={(e) => handleAmountChange(e.target.value, setAmountPaid)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg 
                         focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         transition-all duration-200 outline-none
                         text-gray-900 placeholder-gray-400"
              aria-describedby="amountPaid-hint"
            />
          </div>
          <p id="amountPaid-hint" className="mt-1 text-xs text-gray-500">
            The amount the customer gave you
          </p>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading || !amountOwed || !amountPaid}
        className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-lg
                   hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        aria-busy={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calculating...
          </span>
        ) : (
          'Calculate Change'
        )}
      </button>

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-emerald-900">Change Due</h3>
              <span className="text-2xl font-bold text-emerald-700">
                ${result.changeAmount.toFixed(2)}
              </span>
            </div>

            <p className="text-emerald-800 font-medium">{result.formatted}</p>

            {result.wasRandomized && (
              <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Random denominations applied (divisible by 3)
              </p>
            )}

            {result.warning && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {result.warning}
              </p>
            )}
          </div>

          <ChangeVisual denominations={result.denominations} />
        </div>
      )}
    </div>
  );
}

