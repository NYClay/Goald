import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateCompletionMonths, projectGrowth } from '../src/utils/compoundInterest';

test('projectGrowth adds contribution and interest each month', () => {
  const balances = projectGrowth(1000, 100, 12, 3);
  assert.equal(balances.length, 3);
  assert.ok(balances[0] > 1100);
  assert.ok(balances[1] > balances[0]);
  assert.ok(balances[2] > balances[1]);
});

test('projectGrowth with 0 months returns empty array', () => {
  assert.deepEqual(projectGrowth(1000, 100, 12, 0), []);
});

test('projectGrowth with 0% interest is linear accumulation', () => {
  const balances = projectGrowth(0, 100, 0, 5);
  assert.deepEqual(balances, [100, 200, 300, 400, 500]);
});

test('projectGrowth with 0% interest and starting balance', () => {
  const balances = projectGrowth(500, 100, 0, 3);
  assert.deepEqual(balances, [600, 700, 800]);
});

test('projectGrowth compounds correctly at 12% annual (1% monthly)', () => {
  // Month 1: 1000 * 1.01 + 100 = 1110
  // Month 2: 1110 * 1.01 + 100 = 1221.10
  const balances = projectGrowth(1000, 100, 12, 2);
  assert.ok(Math.abs(balances[0] - 1110) < 0.01);
  assert.ok(Math.abs(balances[1] - 1221.1) < 0.01);
});

test('estimateCompletionMonths reaches target for positive contributions', () => {
  const months = estimateCompletionMonths(0, 1200, 100, 0);
  assert.equal(months, 12);
});

test('estimateCompletionMonths returns Infinity when no growth path exists', () => {
  const months = estimateCompletionMonths(0, 5000, 0, 0);
  assert.equal(months, Infinity);
});

test('estimateCompletionMonths caps loop with very slow growth', () => {
  const months = estimateCompletionMonths(0, 1_000_000_000, 1, 0);
  assert.equal(months, 1200);
});

test('estimateCompletionMonths returns 0 when already at target', () => {
  assert.equal(estimateCompletionMonths(1000, 1000, 100, 0), 0);
});

test('estimateCompletionMonths returns 0 when already above target', () => {
  assert.equal(estimateCompletionMonths(2000, 1000, 100, 0), 0);
});

test('estimateCompletionMonths with interest reaches target faster', () => {
  const withInterest = estimateCompletionMonths(0, 5000, 80, 12);
  const withoutInterest = estimateCompletionMonths(0, 5000, 80, 0);
  assert.ok(withInterest < withoutInterest);
});

test('estimateCompletionMonths lump sum growth (no contributions)', () => {
  // £1000 at 12% annual, target £2000, no contributions
  // Should take ~70 months (Rule of 72: 72/12 = 6 years to double)
  const months = estimateCompletionMonths(1000, 2000, 0, 12);
  assert.ok(months > 60 && months < 80);
});

test('estimateCompletionMonths with 0 monthly contribution but positive balance', () => {
  // £1000, 0% interest, no contributions — cannot reach £2000
  assert.equal(estimateCompletionMonths(1000, 2000, 0, 0), Infinity);
});

test('estimateCompletionMonths returns Infinity for negative contribution', () => {
  assert.equal(estimateCompletionMonths(0, 5000, -100, 5), Infinity);
});

test('estimateCompletionMonths with negative interest rate', () => {
  // Negative rate: balance shrinks. With small contributions, may never reach target.
  const months = estimateCompletionMonths(1000, 5000, 50, -10);
  // Negative 10% annual + £50/month on £1000 — balance will grow slowly
  assert.ok(months > 0);
});
