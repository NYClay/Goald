import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatWholeNumber, parseNumberInput } from '../src/utils/format';

describe('formatCurrency', () => {
  it('formats positive numbers with $ and two decimals', () => {
    assert.equal(formatCurrency(100), '$100.00');
    assert.equal(formatCurrency(100.5), '$100.50');
    assert.equal(formatCurrency(100.55), '$100.55');
    assert.equal(formatCurrency(1234.56), '$1,234.56');
    assert.equal(formatCurrency(1000000), '$1,000,000.00');
  });

  it('formats zero correctly', () => {
    assert.equal(formatCurrency(0), '$0.00');
  });

  it('formats negative numbers with $ prefix and minus sign', () => {
    // Intl.NumberFormat formats negative as $-50.00 (not -$50.00)
    assert.equal(formatCurrency(-50), '$-50.00');
    assert.equal(formatCurrency(-1234.56), '$-1,234.56');
  });

  it('returns $0.00 for NaN', () => {
    assert.equal(formatCurrency(NaN), '$0.00');
  });

  it('returns $0.00 for Infinity', () => {
    assert.equal(formatCurrency(Infinity), '$0.00');
    assert.equal(formatCurrency(-Infinity), '$0.00');
  });
});

describe('formatWholeNumber', () => {
  it('formats positive numbers with locale separators', () => {
    assert.equal(formatWholeNumber(100), '100');
    assert.equal(formatWholeNumber(1000), '1,000');
    assert.equal(formatWholeNumber(1000000), '1,000,000');
    assert.equal(formatWholeNumber(1234567), '1,234,567');
  });

  it('formats zero correctly', () => {
    assert.equal(formatWholeNumber(0), '0');
  });

  it('formats negative numbers with minus sign', () => {
    assert.equal(formatWholeNumber(-50), '-50');
    assert.equal(formatWholeNumber(-1000), '-1,000');
  });

  it('returns "0" for NaN', () => {
    assert.equal(formatWholeNumber(NaN), '0');
  });

  it('returns "0" for Infinity', () => {
    assert.equal(formatWholeNumber(Infinity), '0');
    assert.equal(formatWholeNumber(-Infinity), '0');
  });

  it('rounds to nearest whole number (not truncate)', () => {
    assert.equal(formatWholeNumber(100.49), '100');
    assert.equal(formatWholeNumber(100.5), '101');
    assert.equal(formatWholeNumber(100.99), '101');
    assert.equal(formatWholeNumber(1000.5), '1,001');
  });
});

describe('parseNumberInput', () => {
  it('parses simple numbers', () => {
    assert.equal(parseNumberInput('100'), 100);
    assert.equal(parseNumberInput('100.50'), 100.5);
    assert.equal(parseNumberInput('0'), 0);
  });

  it('strips commas', () => {
    assert.equal(parseNumberInput('1,000'), 1000);
    assert.equal(parseNumberInput('1,000,000'), 1000000);
    assert.equal(parseNumberInput('1,234.56'), 1234.56);
  });

  it('strips whitespace', () => {
    assert.equal(parseNumberInput(' 100 '), 100);
    assert.equal(parseNumberInput('\t100\n'), 100);
  });

  it('returns 0 for empty string', () => {
    assert.equal(parseNumberInput(''), 0);
    assert.equal(parseNumberInput('   '), 0);
  });

  it('parses leading number from non-numeric strings', () => {
    assert.equal(parseNumberInput('100abc'), 100);
    assert.equal(parseNumberInput('abc'), 0);
    assert.equal(parseNumberInput('$100'), 0);
  });

  it('handles decimal correctly', () => {
    assert.equal(parseNumberInput('100.5'), 100.5);
    assert.equal(parseNumberInput('.5'), 0.5);
    assert.equal(parseNumberInput('0.5'), 0.5);
  });

  it('returns 0 for invalid numbers', () => {
    assert.equal(parseNumberInput('NaN'), 0);
    assert.equal(parseNumberInput('Infinity'), 0);
  });
});
