import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeEarnedBadges } from '../src/utils/badges';

describe('computeEarnedBadges', () => {
  it('awards first_deposit badge on first deposit', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 1,
      currentStreak: 0,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.ok(badges.includes('first_deposit'));
  });

  it('does not award first_deposit when totalDeposits is 0', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 0,
      currentStreak: 0,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.equal(badges.includes('first_deposit'), false);
  });

  it('awards halfway badge when crossing 50%', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 1,
      currentStreak: 0,
      goalCount: 0,
      hasHalfway: true,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.ok(badges.includes('halfway'));
  });

  it('awards completed badge when goal is complete', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 1,
      currentStreak: 0,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: true,
      existingBadges: [],
    });
    assert.ok(badges.includes('completed'));
  });

  it('awards streak_3 at 3-month streak', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 3,
      currentStreak: 3,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.ok(badges.includes('streak_3'));
  });

  it('does not award streak_3 at 2-month streak', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 2,
      currentStreak: 2,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.equal(badges.includes('streak_3'), false);
  });

  it('awards streak_6 at 6-month streak', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 6,
      currentStreak: 6,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.ok(badges.includes('streak_6'));
  });

  it('awards multi_goal with 3+ goals', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 0,
      currentStreak: 0,
      goalCount: 3,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: [],
    });
    assert.ok(badges.includes('multi_goal'));
  });

  it('preserves existing badges', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 1,
      currentStreak: 0,
      goalCount: 0,
      hasHalfway: false,
      hasCompleted: false,
      existingBadges: ['streak_6', 'multi_goal'],
    });
    assert.ok(badges.includes('streak_6'));
    assert.ok(badges.includes('multi_goal'));
    assert.ok(badges.includes('first_deposit'));
  });

  it('does not duplicate badges', () => {
    const badges = computeEarnedBadges({
      totalDeposits: 10,
      currentStreak: 6,
      goalCount: 3,
      hasHalfway: true,
      hasCompleted: true,
      existingBadges: ['first_deposit'],
    });
    assert.equal(badges.length, 6);
  });
});
