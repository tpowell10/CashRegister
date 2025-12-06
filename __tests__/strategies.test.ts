import {
    calculateMinimumDenominations,
    calculateRandomDenominations,
    randomWhenDivisibleStrategy,
    minimumDenominationsStrategy,
    RANDOM_DIVISOR
} from '../src/lib/strategies';
import { USD_DENOMINATIONS } from '../src/lib/currencies';

describe('calculateMinimumDenominations', () => {
    it('uses greedy algorithm for minimum coins', () => {
        // 88 cents should be: 3 quarters (75) + 1 dime (10) + 3 pennies (3) = 88
        const result = calculateMinimumDenominations(88, USD_DENOMINATIONS);

        const quarters = result.find(r => r.denomination.name === 'quarter');
        const dimes = result.find(r => r.denomination.name === 'dime');
        const pennies = result.find(r => r.denomination.name === 'penny');

        expect(quarters?.count).toBe(3);
        expect(dimes?.count).toBe(1);
        expect(pennies?.count).toBe(3);
    });

    it('returns empty array for zero cents', () => {
        const result = calculateMinimumDenominations(0, USD_DENOMINATIONS);
        expect(result).toHaveLength(0);
    });

    it('uses largest denominations first', () => {
        // 125 cents = 1 dollar + 1 quarter
        const result = calculateMinimumDenominations(125, USD_DENOMINATIONS);

        const dollars = result.find(r => r.denomination.name === 'dollar');
        const quarters = result.find(r => r.denomination.name === 'quarter');

        expect(dollars?.count).toBe(1);
        expect(quarters?.count).toBe(1);
        expect(result.length).toBe(2);
    });

    it('handles exact denomination amounts', () => {
        // Exactly 25 cents = 1 quarter
        const result = calculateMinimumDenominations(25, USD_DENOMINATIONS);
        expect(result).toHaveLength(1);
        expect(result[0].denomination.name).toBe('quarter');
        expect(result[0].count).toBe(1);
    });

    it('handles large amounts', () => {
        // $99.99 = 9999 cents
        const result = calculateMinimumDenominations(9999, USD_DENOMINATIONS);

        const total = result.reduce(
            (sum, r) => sum + r.count * r.denomination.valueInCents,
            0
        );

        expect(total).toBe(9999);
    });
});

describe('calculateRandomDenominations', () => {
    it('always sums to correct total', () => {
        // Run multiple times to account for randomness
        for (let i = 0; i < 20; i++) {
            const result = calculateRandomDenominations(88, USD_DENOMINATIONS);
            const total = result.reduce(
                (sum, r) => sum + r.count * r.denomination.valueInCents,
                0
            );
            expect(total).toBe(88);
        }
    });

    it('only uses valid denominations', () => {
        const result = calculateRandomDenominations(88, USD_DENOMINATIONS);

        for (const r of result) {
            const validDenom = USD_DENOMINATIONS.find(
                d => d.name === r.denomination.name
            );
            expect(validDenom).toBeDefined();
        }
    });

    it('returns sorted by denomination value (highest first)', () => {
        for (let i = 0; i < 10; i++) {
            const result = calculateRandomDenominations(150, USD_DENOMINATIONS);

            for (let j = 1; j < result.length; j++) {
                expect(result[j - 1].denomination.valueInCents)
                    .toBeGreaterThanOrEqual(result[j].denomination.valueInCents);
            }
        }
    });

    it('handles small amounts', () => {
        const result = calculateRandomDenominations(3, USD_DENOMINATIONS);
        const total = result.reduce(
            (sum, r) => sum + r.count * r.denomination.valueInCents,
            0
        );
        expect(total).toBe(3);
    });

    it('handles zero cents', () => {
        const result = calculateRandomDenominations(0, USD_DENOMINATIONS);
        expect(result).toHaveLength(0);
    });
});

describe('randomWhenDivisibleStrategy', () => {
    // Helper to create context
    const ctx = (owed: number, change: number) => ({
        owedInCents: owed,
        paidInCents: owed + change,
        changeInCents: change,
    });

    it('applies when OWED is divisible by RANDOM_DIVISOR', () => {
        // 333 cents owed, divisible by 3
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(333, 167))).toBe(true);
        // 300 cents owed, divisible by 3
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(300, 200))).toBe(true);
        // 99 cents owed, divisible by 3
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(99, 1))).toBe(true);
    });

    it('does not apply when OWED is not divisible by RANDOM_DIVISOR', () => {
        // 212 cents owed ($2.12), not divisible by 3
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(212, 88))).toBe(false);
        // 197 cents owed ($1.97), not divisible by 3
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(197, 3))).toBe(false);
        // 100 cents owed, not divisible by 3
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(100, 50))).toBe(false);
    });

    it('does not apply for zero change even if owed is divisible', () => {
        expect(randomWhenDivisibleStrategy.shouldApply(ctx(300, 0))).toBe(false);
    });

    it('has correct name', () => {
        expect(randomWhenDivisibleStrategy.name).toBe('randomWhenDivisible');
    });
});

describe('minimumDenominationsStrategy', () => {
    const ctx = (owed: number, change: number) => ({
        owedInCents: owed,
        paidInCents: owed + change,
        changeInCents: change,
    });

    it('always applies (fallback strategy)', () => {
        expect(minimumDenominationsStrategy.shouldApply(ctx(0, 0))).toBe(true);
        expect(minimumDenominationsStrategy.shouldApply(ctx(100, 1))).toBe(true);
        expect(minimumDenominationsStrategy.shouldApply(ctx(500, 100))).toBe(true);
        expect(minimumDenominationsStrategy.shouldApply(ctx(9999, 1))).toBe(true);
    });

    it('has correct name', () => {
        expect(minimumDenominationsStrategy.name).toBe('minimumDenominations');
    });
});

describe('RANDOM_DIVISOR', () => {
    it('is set to 3 by default', () => {
        expect(RANDOM_DIVISOR).toBe(3);
    });
});

