import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCrossedMilestones,
  calculateStreak,
  computeDepositStats,
} from '../src/utils/depositUtils';

describe('getCrossedMilestones', () => {
  it('returns no milestones when progress does not cross any threshold', () => {
    assert.deepEqual(getCrossedMilestones(0, 0.1), []);
    assert.deepEqual(getCrossedMilestones(0.1, 0.2), []);
    assert.deepEqual(getCrossedMilestones(0.9, 0.95), []);
  });

  it('detects crossing 25% milestone', () => {
    assert.deepEqual(getCrossedMilestones(0.2, 0.3), [25]);
  });

  it('detects crossing multiple milestones', () => {
    assert.deepEqual(getCrossedMilestones(0.2, 0.6), [25, 50]);
  });

  it('detects crossing all three milestones', () => {
    assert.deepEqual(getCrossedMilestones(0.2, 0.8), [25, 50, 75]);
  });

  it('does not trigger on exact boundary from below', () => {
    assert.deepEqual(getCrossedMilestones(0.24, 0.25), [25]);
  });

  it('does not trigger when already past milestone', () => {
    assert.deepEqual(getCrossedMilestones(0.3, 0.4), []);
  });
});

describe('calculateStreak', () => {
  it('starts streak at 1 for first deposit', () => {
    const result = calculateStreak(0, '');
    assert.equal(result.newStreak, 1);
    assert.ok(result.currentMonth.length > 0);
  });

  it('increments streak when depositing in consecutive month', () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const result = calculateStreak(5, lastMonthStr);
    assert.equal(result.newStreak, 6);
  });

  it('resets streak when skipping a month', () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const monthStr = `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
    const result = calculateStreak(5, monthStr);
    assert.equal(result.newStreak, 1);
  });

  it('maintains streak when depositing twice in same month', () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const result = calculateStreak(3, currentMonth);
    assert.equal(result.newStreak, 3);
  });
});

describe('computeDepositStats', () => {
  const baseInput = {
    currentBalance: 100,
    targetAmount: 400,
    depositAmount: 100,
    stats: {
      currentStreak: 2,
      lastDepositMonth: '',
      badges: [],
      totalDeposits: 5,
    },
    goalCount: 1,
    existingBadges: [],
  };

  it('computes new balance correctly', () => {
    const result = computeDepositStats(baseInput);
    assert.equal(result.newBalance, 200);
  });

  it('detects goal completion when balance reaches target', () => {
    const input = {
      currentBalance: 0,
      targetAmount: 400,
      depositAmount: 400,
      stats: { currentStreak: 2, lastDepositMonth: '', badges: [], totalDeposits: 5 },
      goalCount: 1,
      existingBadges: [],
    };
    const result = computeDepositStats(input);
    assert.equal(result.isCompleted, true);
    assert.equal(result.crossedMilestones.includes(75), true);
    assert.equal(result.crossedMilestones.includes(50), true);
    assert.equal(result.crossedMilestones.includes(25), true);
  });

  it('detects crossing 50% milestone', () => {
    const input = { ...baseInput, currentBalance: 100, depositAmount: 100 };
    const result = computeDepositStats(input);
    assert.equal(result.newBalance, 200);
    assert.equal(result.wasBelowHalfway, true);
    assert.equal(result.isNowAtOrAboveHalfway, true);
  });

  it('handles zero target amount gracefully', () => {
    const input = { ...baseInput, targetAmount: 0 };
    const result = computeDepositStats(input);
    assert.equal(result.crossedMilestones.length, 0);
    assert.equal(result.isCompleted, true);
  });
});
