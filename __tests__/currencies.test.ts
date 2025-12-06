import { USD, EUR, USD_DENOMINATIONS, EUR_DENOMINATIONS, CURRENCIES, DEFAULT_CURRENCY } from '../src/lib/currencies';

describe('USD Currency', () => {
  it('has correct code and symbol', () => {
    expect(USD.code).toBe('USD');
    expect(USD.symbol).toBe('$');
    expect(USD.name).toBe('US Dollar');
  });

  it('has all expected denominations including bills', () => {
    const denomNames = USD_DENOMINATIONS.map(d => d.name);
    // Bills
    expect(denomNames).toContain('hundred');
    expect(denomNames).toContain('fifty');
    expect(denomNames).toContain('twenty');
    expect(denomNames).toContain('ten');
    expect(denomNames).toContain('five');
    expect(denomNames).toContain('dollar');
    // Coins
    expect(denomNames).toContain('quarter');
    expect(denomNames).toContain('dime');
    expect(denomNames).toContain('nickel');
    expect(denomNames).toContain('penny');
  });

  it('denominations are sorted highest to lowest', () => {
    for (let i = 1; i < USD_DENOMINATIONS.length; i++) {
      expect(USD_DENOMINATIONS[i - 1].valueInCents)
        .toBeGreaterThan(USD_DENOMINATIONS[i].valueInCents);
    }
  });

  it('has correct values in cents for all denominations', () => {
    // Bills
    const hundred = USD_DENOMINATIONS.find(d => d.name === 'hundred');
    const fifty = USD_DENOMINATIONS.find(d => d.name === 'fifty');
    const twenty = USD_DENOMINATIONS.find(d => d.name === 'twenty');
    const ten = USD_DENOMINATIONS.find(d => d.name === 'ten');
    const five = USD_DENOMINATIONS.find(d => d.name === 'five');
    const dollar = USD_DENOMINATIONS.find(d => d.name === 'dollar');
    // Coins
    const quarter = USD_DENOMINATIONS.find(d => d.name === 'quarter');
    const dime = USD_DENOMINATIONS.find(d => d.name === 'dime');
    const nickel = USD_DENOMINATIONS.find(d => d.name === 'nickel');
    const penny = USD_DENOMINATIONS.find(d => d.name === 'penny');

    expect(hundred?.valueInCents).toBe(10000);
    expect(fifty?.valueInCents).toBe(5000);
    expect(twenty?.valueInCents).toBe(2000);
    expect(ten?.valueInCents).toBe(1000);
    expect(five?.valueInCents).toBe(500);
    expect(dollar?.valueInCents).toBe(100);
    expect(quarter?.valueInCents).toBe(25);
    expect(dime?.valueInCents).toBe(10);
    expect(nickel?.valueInCents).toBe(5);
    expect(penny?.valueInCents).toBe(1);
  });

  it('has singular and plural forms', () => {
    const penny = USD_DENOMINATIONS.find(d => d.name === 'penny');
    expect(penny?.singular).toBe('penny');
    expect(penny?.plural).toBe('pennies');

    const dollar = USD_DENOMINATIONS.find(d => d.name === 'dollar');
    expect(dollar?.singular).toBe('dollar');
    expect(dollar?.plural).toBe('dollars');
  });
});

describe('EUR Currency', () => {
  it('has correct code and symbol', () => {
    expect(EUR.code).toBe('EUR');
    expect(EUR.symbol).toBe('€');
    expect(EUR.name).toBe('Euro');
  });

  it('has expected denominations', () => {
    const denomNames = EUR_DENOMINATIONS.map(d => d.name);
    expect(denomNames).toContain('euro');
    expect(denomNames).toContain('fifty-cent');
    expect(denomNames).toContain('one-cent');
  });

  it('denominations are sorted highest to lowest', () => {
    for (let i = 1; i < EUR_DENOMINATIONS.length; i++) {
      expect(EUR_DENOMINATIONS[i - 1].valueInCents)
        .toBeGreaterThan(EUR_DENOMINATIONS[i].valueInCents);
    }
  });

  it('has correct values', () => {
    const euro = EUR_DENOMINATIONS.find(d => d.name === 'euro');
    const fiftyCent = EUR_DENOMINATIONS.find(d => d.name === 'fifty-cent');
    const oneCent = EUR_DENOMINATIONS.find(d => d.name === 'one-cent');

    expect(euro?.valueInCents).toBe(100);
    expect(fiftyCent?.valueInCents).toBe(50);
    expect(oneCent?.valueInCents).toBe(1);
  });
});

describe('CURRENCIES', () => {
  it('contains USD', () => {
    expect(CURRENCIES['USD']).toBeDefined();
    expect(CURRENCIES['USD'].code).toBe('USD');
  });

  it('contains EUR', () => {
    expect(CURRENCIES['EUR']).toBeDefined();
    expect(CURRENCIES['EUR'].code).toBe('EUR');
  });
});

describe('DEFAULT_CURRENCY', () => {
  it('is USD', () => {
    expect(DEFAULT_CURRENCY).toBe(USD);
  });
});

