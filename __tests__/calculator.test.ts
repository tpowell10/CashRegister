import { calculateChange, formatDenominations, calculateBatch, formatBatchResults } from '../src/lib/calculator';
import { InsufficientPaymentError, NegativeAmountError } from '../src/lib/errors';
import { USD } from '../src/lib/currencies';
import { minimumDenominationsStrategy } from '../src/lib/strategies';

describe('calculateChange', () => {
    const options = {
        currency: USD,
        strategies: [minimumDenominationsStrategy]
    };

    describe('basic calculations', () => {
        it('calculates correct change for 2.12 owed, 3.00 paid', () => {
            const result = calculateChange(2.12, 3.00, options);
            expect(result.changeAmount).toBe(0.88);
            expect(result.formatted).toBe('3 quarters,1 dime,3 pennies');
        });

        it('calculates correct change for 1.97 owed, 2.00 paid', () => {
            const result = calculateChange(1.97, 2.00, options);
            expect(result.changeAmount).toBe(0.03);
            expect(result.formatted).toBe('3 pennies');
        });

        it('returns "No change" for exact payment', () => {
            const result = calculateChange(5.00, 5.00, options);
            expect(result.changeAmount).toBe(0);
            expect(result.formatted).toBe('No change');
        });

        it('handles dollar amounts correctly', () => {
            const result = calculateChange(3.00, 5.00, options);
            expect(result.changeAmount).toBe(2);
            expect(result.formatted).toBe('2 dollars');
        });

        it('uses singular form for single denomination', () => {
            const result = calculateChange(4.00, 5.00, options);
            expect(result.formatted).toBe('1 dollar');
        });

        it('handles mixed denominations', () => {
            const result = calculateChange(0.14, 1.00, options);
            expect(result.changeAmount).toBe(0.86);
            expect(result.formatted).toBe('3 quarters,1 dime,1 penny');
        });
    });

    describe('bill denominations', () => {
        it('uses $100 bill for large amounts', () => {
            const result = calculateChange(50.00, 200.00, options);
            expect(result.changeAmount).toBe(150);
            expect(result.formatted).toBe('1 hundred dollar bill,1 fifty dollar bill');
        });

        it('uses $50 bill correctly', () => {
            const result = calculateChange(10.00, 60.00, options);
            expect(result.changeAmount).toBe(50);
            expect(result.formatted).toBe('1 fifty dollar bill');
        });

        it('uses $20 bill correctly', () => {
            const result = calculateChange(5.00, 25.00, options);
            expect(result.changeAmount).toBe(20);
            expect(result.formatted).toBe('1 twenty dollar bill');
        });

        it('uses $10 bill correctly', () => {
            const result = calculateChange(5.00, 15.00, options);
            expect(result.changeAmount).toBe(10);
            expect(result.formatted).toBe('1 ten dollar bill');
        });

        it('uses $5 bill correctly', () => {
            const result = calculateChange(2.00, 7.00, options);
            expect(result.changeAmount).toBe(5);
            expect(result.formatted).toBe('1 five dollar bill');
        });

        it('uses optimal bill combination for $37.50', () => {
            const result = calculateChange(12.50, 50.00, options);
            expect(result.changeAmount).toBe(37.50);
            expect(result.formatted).toBe('1 twenty dollar bill,1 ten dollar bill,1 five dollar bill,2 dollars,2 quarters');
        });

        it('uses multiple bills of same denomination', () => {
            const result = calculateChange(10.00, 50.00, options);
            expect(result.changeAmount).toBe(40);
            expect(result.formatted).toBe('2 twenty dollar bills');
        });

        it('handles large change with mixed bills and coins', () => {
            const result = calculateChange(0.13, 100.00, options);
            expect(result.changeAmount).toBe(99.87);
            // $99.87 = 1x$50 + 2x$20 + 1x$5 + 4x$1 + 3 quarters + 1 dime + 2 pennies
            expect(result.formatted).toBe('1 fifty dollar bill,2 twenty dollar bills,1 five dollar bill,4 dollars,3 quarters,1 dime,2 pennies');
        });
    });

    describe('edge cases', () => {
        it('throws InsufficientPaymentError when paid < owed', () => {
            expect(() => calculateChange(10.00, 5.00, options))
                .toThrow(InsufficientPaymentError);
        });

        it('throws NegativeAmountError for negative amount owed', () => {
            expect(() => calculateChange(-5.00, 10.00, options))
                .toThrow(NegativeAmountError);
        });

        it('throws NegativeAmountError for negative amount paid', () => {
            expect(() => calculateChange(5.00, -10.00, options))
                .toThrow(NegativeAmountError);
        });

        it('handles very small change (1 penny)', () => {
            const result = calculateChange(0.99, 1.00, options);
            expect(result.changeAmount).toBe(0.01);
            expect(result.formatted).toBe('1 penny');
        });

        it('handles floating point precision correctly', () => {
            // 0.1 + 0.2 !== 0.3 in JavaScript, but we handle it
            const result = calculateChange(0.10, 0.40, options);
            expect(result.changeAmount).toBe(0.30);
            expect(result.formatted).toBe('1 quarter,1 nickel');
        });

        it('adds warning for large overpayment (>= $100 change)', () => {
            const result = calculateChange(1.00, 150.00, options);
            expect(result.warning).toBeDefined();
            expect(result.warning).toContain('Large change amount');
        });

        it('does not add warning for change under $100', () => {
            const result = calculateChange(1.00, 50.00, options);
            expect(result.warning).toBeUndefined();
        });
    });

    describe('InsufficientPaymentError details', () => {
        it('includes shortfall amount in error', () => {
            try {
                calculateChange(10.00, 7.50, options);
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(InsufficientPaymentError);
                const e = error as InsufficientPaymentError;
                expect(e.shortfall).toBe(2.50);
                expect(e.amountOwed).toBe(10.00);
                expect(e.amountPaid).toBe(7.50);
            }
        });
    });
});

describe('calculateChange with random strategy', () => {
    // Use default strategies (includes random when OWED is divisible by 3)

    it('marks result as randomized when OWED is divisible by 3', () => {
        // $3.33 owed = 333 cents, divisible by 3
        const result = calculateChange(3.33, 5.00);
        expect(result.wasRandomized).toBe(true);
    });

    it('does not randomize when OWED is not divisible by 3', () => {
        // $2.12 owed = 212 cents, not divisible by 3
        const result = calculateChange(2.12, 3.00);
        expect(result.wasRandomized).toBe(false);
    });

    it('does not randomize 1.97 owed (197 not divisible by 3)', () => {
        // $1.97 owed = 197 cents, not divisible by 3
        const result = calculateChange(1.97, 2.00);
        expect(result.wasRandomized).toBe(false);
        expect(result.formatted).toBe('3 pennies'); // minimum denominations
    });

    it('random result still sums to correct total', () => {
        // $3.00 owed = 300 cents, divisible by 3
        for (let i = 0; i < 10; i++) {
            const result = calculateChange(3.00, 5.00);
            const total = result.denominations.reduce(
                (sum, d) => sum + d.count * d.denomination.valueInCents,
                0
            );
            expect(total).toBe(result.changeInCents);
        }
    });
});

describe('formatDenominations', () => {
    it('returns "No change" for empty array', () => {
        expect(formatDenominations([])).toBe('No change');
    });

    it('filters out zero counts', () => {
        const result = formatDenominations([
            { denomination: { name: 'quarter', singular: 'quarter', plural: 'quarters', valueInCents: 25 }, count: 0 },
            { denomination: { name: 'dime', singular: 'dime', plural: 'dimes', valueInCents: 10 }, count: 2 },
        ]);
        expect(result).toBe('2 dimes');
    });
});

describe('calculateBatch', () => {
    const options = {
        currency: USD,
        strategies: [minimumDenominationsStrategy]
    };

    it('processes multiple lines correctly', () => {
        const input = '2.12,3.00\n1.97,2.00';
        const result = calculateBatch(input, options);

        expect(result.results).toHaveLength(2);
        expect(result.errors).toHaveLength(0);
        expect(result.results[0].formatted).toBe('3 quarters,1 dime,3 pennies');
        expect(result.results[1].formatted).toBe('3 pennies');
    });

    it('skips empty lines', () => {
        const input = '2.12,3.00\n\n1.97,2.00\n';
        const result = calculateBatch(input, options);

        expect(result.results).toHaveLength(2);
        expect(result.errors).toHaveLength(0);
    });

    it('collects errors for invalid lines', () => {
        const input = '2.12,3.00\ninvalid\n1.97,2.00';
        const result = calculateBatch(input, options);

        expect(result.results).toHaveLength(2);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].lineNumber).toBe(2);
    });

    it('handles Windows line endings', () => {
        const input = '2.12,3.00\r\n1.97,2.00';
        const result = calculateBatch(input, options);

        expect(result.results).toHaveLength(2);
        expect(result.errors).toHaveLength(0);
    });

    it('collects insufficient payment as error', () => {
        const input = '10.00,5.00';
        const result = calculateBatch(input, options);

        expect(result.results).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toContain('Insufficient payment');
    });
});

describe('formatBatchResults', () => {
    it('joins results with newlines', () => {
        const options = {
            currency: USD,
            strategies: [minimumDenominationsStrategy]
        };
        const batch = calculateBatch('2.12,3.00\n1.97,2.00', options);
        const formatted = formatBatchResults(batch);

        expect(formatted).toBe('3 quarters,1 dime,3 pennies\n3 pennies');
    });
});

