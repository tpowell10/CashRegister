import { Currency, Denomination } from './types';

/**
 * US Dollar denominations
 * Sorted from highest to lowest value for greedy algorithm
 */
export const USD_DENOMINATIONS: Denomination[] = [
    { name: 'hundred', singular: 'hundred dollar bill', plural: 'hundred dollar bills', valueInCents: 10000 },
    { name: 'fifty', singular: 'fifty dollar bill', plural: 'fifty dollar bills', valueInCents: 5000 },
    { name: 'twenty', singular: 'twenty dollar bill', plural: 'twenty dollar bills', valueInCents: 2000 },
    { name: 'ten', singular: 'ten dollar bill', plural: 'ten dollar bills', valueInCents: 1000 },
    { name: 'five', singular: 'five dollar bill', plural: 'five dollar bills', valueInCents: 500 },
    { name: 'dollar', singular: 'dollar', plural: 'dollars', valueInCents: 100 },
    { name: 'quarter', singular: 'quarter', plural: 'quarters', valueInCents: 25 },
    { name: 'dime', singular: 'dime', plural: 'dimes', valueInCents: 10 },
    { name: 'nickel', singular: 'nickel', plural: 'nickels', valueInCents: 5 },
    { name: 'penny', singular: 'penny', plural: 'pennies', valueInCents: 1 },
];

/**
 * US Dollar currency configuration
 */
export const USD: Currency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    denominations: USD_DENOMINATIONS,
};

/**
 * Euro denominations (ready for France expansion)
 * Sorted from highest to lowest value
 */
export const EUR_DENOMINATIONS: Denomination[] = [
    { name: 'euro', singular: 'euro', plural: 'euros', valueInCents: 100 },
    { name: 'fifty-cent', singular: '50 cent', plural: '50 cents', valueInCents: 50 },
    { name: 'twenty-cent', singular: '20 cent', plural: '20 cents', valueInCents: 20 },
    { name: 'ten-cent', singular: '10 cent', plural: '10 cents', valueInCents: 10 },
    { name: 'five-cent', singular: '5 cent', plural: '5 cents', valueInCents: 5 },
    { name: 'two-cent', singular: '2 cent', plural: '2 cents', valueInCents: 2 },
    { name: 'one-cent', singular: '1 cent', plural: '1 cents', valueInCents: 1 },
];

/**
 * Euro currency configuration
 */
export const EUR: Currency = {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    denominations: EUR_DENOMINATIONS,
};

/**
 * Available currencies
 */
export const CURRENCIES: Record<string, Currency> = {
    USD,
    EUR,
};

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = USD;

