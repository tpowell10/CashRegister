import { parseAmount, parseLine, parseInput, dollarsToCents, centsToDollars } from '../src/lib/parser';
import { InvalidInputError } from '../src/lib/errors';

describe('parseAmount', () => {
  describe('valid inputs', () => {
    it('parses simple decimal number', () => {
      expect(parseAmount('2.13')).toBe(2.13);
    });

    it('parses integer', () => {
      expect(parseAmount('5')).toBe(5);
    });

    it('parses number with dollar sign', () => {
      expect(parseAmount('$2.13')).toBe(2.13);
    });

    it('parses number with euro sign', () => {
      expect(parseAmount('€2.13')).toBe(2.13);
    });

    it('strips leading/trailing whitespace', () => {
      expect(parseAmount('  2.13  ')).toBe(2.13);
    });

    it('handles numbers with commas (thousands separator)', () => {
      expect(parseAmount('1,234.56')).toBe(1234.56);
    });

    it('rounds to 2 decimal places', () => {
      expect(parseAmount('2.129')).toBe(2.13);
      expect(parseAmount('2.121')).toBe(2.12);
    });

    it('parses zero', () => {
      expect(parseAmount('0')).toBe(0);
      expect(parseAmount('0.00')).toBe(0);
    });
  });

  describe('invalid inputs', () => {
    it('throws on empty string', () => {
      expect(() => parseAmount('')).toThrow(InvalidInputError);
    });

    it('throws on whitespace only', () => {
      expect(() => parseAmount('   ')).toThrow(InvalidInputError);
    });

    it('throws on non-numeric string', () => {
      expect(() => parseAmount('abc')).toThrow(InvalidInputError);
    });

    it('throws on negative number', () => {
      expect(() => parseAmount('-5.00')).toThrow(InvalidInputError);
    });

    it('throws on infinity', () => {
      expect(() => parseAmount('Infinity')).toThrow(InvalidInputError);
    });
  });
});

describe('parseLine', () => {
  describe('valid inputs', () => {
    it('parses standard format', () => {
      const result = parseLine('2.13,3.00', 1);
      expect(result.amountOwed).toBe(2.13);
      expect(result.amountPaid).toBe(3.00);
      expect(result.lineNumber).toBe(1);
    });

    it('parses with currency symbols', () => {
      const result = parseLine('$2.13,$3.00', 1);
      expect(result.amountOwed).toBe(2.13);
      expect(result.amountPaid).toBe(3.00);
    });

    it('parses with extra whitespace', () => {
      const result = parseLine('  2.13 , 3.00  ', 1);
      expect(result.amountOwed).toBe(2.13);
      expect(result.amountPaid).toBe(3.00);
    });

    it('ignores extra comma-separated values', () => {
      const result = parseLine('2.13,3.00,extra,stuff', 1);
      expect(result.amountOwed).toBe(2.13);
      expect(result.amountPaid).toBe(3.00);
    });

    it('preserves raw input', () => {
      const raw = '2.13,3.00';
      const result = parseLine(raw, 1);
      expect(result.raw).toBe(raw);
    });
  });

  describe('invalid inputs', () => {
    it('throws on empty line', () => {
      expect(() => parseLine('', 1)).toThrow(InvalidInputError);
    });

    it('throws on missing comma', () => {
      expect(() => parseLine('2.13 3.00', 1)).toThrow(InvalidInputError);
    });

    it('throws on single value', () => {
      expect(() => parseLine('2.13', 1)).toThrow(InvalidInputError);
    });

    it('includes line number in error', () => {
      try {
        parseLine('invalid', 5);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        expect((error as InvalidInputError).lineNumber).toBe(5);
        expect((error as InvalidInputError).message).toContain('Line 5');
      }
    });

    it('throws on invalid owed amount', () => {
      expect(() => parseLine('abc,3.00', 1)).toThrow(InvalidInputError);
    });

    it('throws on invalid paid amount', () => {
      expect(() => parseLine('2.13,xyz', 1)).toThrow(InvalidInputError);
    });
  });
});

describe('parseInput', () => {
  it('parses multiple lines', () => {
    const input = '2.12,3.00\n1.97,2.00\n3.33,5.00';
    const { parsed, errors } = parseInput(input);
    
    expect(parsed).toHaveLength(3);
    expect(errors).toHaveLength(0);
    expect(parsed[0].amountOwed).toBe(2.12);
    expect(parsed[1].amountOwed).toBe(1.97);
    expect(parsed[2].amountOwed).toBe(3.33);
  });

  it('skips empty lines', () => {
    const input = '2.12,3.00\n\n1.97,2.00\n\n';
    const { parsed, errors } = parseInput(input);
    
    expect(parsed).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it('skips comment lines (starting with #)', () => {
    const input = '# This is a comment\n2.12,3.00\n# Another comment\n1.97,2.00';
    const { parsed, errors } = parseInput(input);
    
    expect(parsed).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it('handles Windows line endings', () => {
    const input = '2.12,3.00\r\n1.97,2.00';
    const { parsed, errors } = parseInput(input);
    
    expect(parsed).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it('collects errors separately', () => {
    const input = '2.12,3.00\ninvalid line\n1.97,2.00';
    const { parsed, errors } = parseInput(input);
    
    expect(parsed).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0].lineNumber).toBe(2);
    expect(errors[0].raw).toBe('invalid line');
  });

  it('handles empty input', () => {
    const { parsed, errors } = parseInput('');
    expect(parsed).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('handles input with only empty lines', () => {
    const { parsed, errors } = parseInput('\n\n\n');
    expect(parsed).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('assigns correct line numbers', () => {
    const input = '2.12,3.00\n\n1.97,2.00';
    const { parsed } = parseInput(input);
    
    expect(parsed[0].lineNumber).toBe(1);
    expect(parsed[1].lineNumber).toBe(3);
  });
});

describe('dollarsToCents', () => {
  it('converts dollars to cents', () => {
    expect(dollarsToCents(1.00)).toBe(100);
    expect(dollarsToCents(2.50)).toBe(250);
    expect(dollarsToCents(0.01)).toBe(1);
  });

  it('handles floating point correctly', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(dollarsToCents(0.1 + 0.2)).toBe(30);
  });

  it('rounds to nearest cent', () => {
    expect(dollarsToCents(1.999)).toBe(200);
    expect(dollarsToCents(1.994)).toBe(199);
  });
});

describe('centsToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centsToDollars(100)).toBe(1.00);
    expect(centsToDollars(250)).toBe(2.50);
    expect(centsToDollars(1)).toBe(0.01);
  });
});


