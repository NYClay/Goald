import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSize,
  calculateMood,
  calculateLevel,
  xpForNextLevel,
  getBearDisplayData,
  getCaveProgress,
} from '../src/utils/bearUtils';
import { Timestamp } from 'firebase/firestore';
import { Cave, Bear, Size, Mood, AccessoryId, LEVEL_XP } from '../src/types';

describe('calculateSize', () => {
  it('returns cub for levels 1-3', () => {
    assert.equal(calculateSize(1), 'cub');
    assert.equal(calculateSize(2), 'cub');
    assert.equal(calculateSize(3), 'cub');
  });

  it('returns grown for levels 4-7', () => {
    assert.equal(calculateSize(4), 'grown');
    assert.equal(calculateSize(5), 'grown');
    assert.equal(calculateSize(6), 'grown');
    assert.equal(calculateSize(7), 'grown');
  });

  it('returns giant for levels 8-10', () => {
    assert.equal(calculateSize(8), 'giant');
    assert.equal(calculateSize(9), 'giant');
    assert.equal(calculateSize(10), 'giant');
  });

  it('returns giant for level > 10', () => {
    assert.equal(calculateSize(11), 'giant');
    assert.equal(calculateSize(100), 'giant');
  });
});

describe('calculateMood', () => {
  const today = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();

  it('returns hungry when lastFeedDate is null', () => {
    assert.equal(calculateMood(null, 0), 'hungry');
    assert.equal(calculateMood(null, 1000), 'hungry');
  });

  it('returns ecstatic when fed today and xp > 500', () => {
    assert.equal(calculateMood(today, 501), 'ecstatic');
    assert.equal(calculateMood(today, 1000), 'ecstatic');
  });

  it('returns happy when fed today and xp <= 500', () => {
    assert.equal(calculateMood(today, 0), 'happy');
    assert.equal(calculateMood(today, 500), 'happy');
  });

  it('returns content when fed yesterday', () => {
    assert.equal(calculateMood(yesterday, 0), 'content');
    assert.equal(calculateMood(yesterday, 1000), 'content');
  });

  it('returns hungry when fed 2+ days ago', () => {
    assert.equal(calculateMood(twoDaysAgo, 0), 'hungry');
    assert.equal(calculateMood(threeDaysAgo, 1000), 'hungry');
  });
});

describe('calculateLevel', () => {
  it('returns level 1 for 0 xp', () => {
    assert.equal(calculateLevel(0), 1);
  });

  it('returns correct level for exact xp thresholds', () => {
    for (let level = 1; level <= 10; level++) {
      assert.equal(calculateLevel(LEVEL_XP[level]), level);
    }
  });

  it('returns correct level for xp between thresholds', () => {
    assert.equal(calculateLevel(LEVEL_XP[1] + 50), 1);
    assert.equal(calculateLevel(LEVEL_XP[2] - 1), 1);
    assert.equal(calculateLevel(LEVEL_XP[5] + 100), 5);
  });

  it('returns max level 10 for very high xp', () => {
    assert.equal(calculateLevel(LEVEL_XP[10] + 10000), 10);
    assert.equal(calculateLevel(1000000), 10);
  });
});

describe('xpForNextLevel', () => {
  it('returns 0 for max level 10', () => {
    assert.equal(xpForNextLevel(10), 0);
    assert.equal(xpForNextLevel(11), 0);
  });

  it('returns total xp required for next level', () => {
    assert.equal(xpForNextLevel(1), LEVEL_XP[2]);
    assert.equal(xpForNextLevel(5), LEVEL_XP[6]);
    assert.equal(xpForNextLevel(9), LEVEL_XP[10]);
  });
});

describe('getBearDisplayData', () => {
  const baseBear: Bear = {
    id: 'bear_1',
    userId: 'user_1',
    name: 'Test Bear',
    level: 1,
    xp: 0,
    size: 'cub',
    accessories: [],
    mood: 'happy',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  it('returns correct display data for level 1 bear with 0 xp', () => {
    const bear = { ...baseBear, level: 1, xp: 0 };
    const display = getBearDisplayData(bear);
    assert.equal(display.level, 1);
    assert.equal(display.xpProgress, 0);
    assert.equal(display.xpToNext, LEVEL_XP[2]);
  });

  it('returns correct display data for level 1 bear with partial xp', () => {
    const bear = { ...baseBear, level: 1, xp: 50 };
    const display = getBearDisplayData(bear);
    assert.equal(display.xpProgress, 50 / LEVEL_XP[2]);
    assert.equal(display.xpToNext, LEVEL_XP[2] - 50);
  });

  it('returns correct display data for mid-level bear', () => {
    const bear = { ...baseBear, level: 5, xp: LEVEL_XP[5] + 200 };
    const display = getBearDisplayData(bear);
    assert.equal(display.level, 5);
    // currentLevelXp = 900 - 450 = 450
    // nextLevelXp = LEVEL_XP[6] = 1000
    // progress = 450 / 1000 = 0.45
    assert.equal(display.xpProgress, 0.45);
    assert.equal(display.xpToNext, 550); // 1000 - 450
  });

  it('returns xpProgress 1 and xpToNext negative for max level 10 (current behavior)', () => {
    const bear = { ...baseBear, level: 10, xp: LEVEL_XP[10] + 100 };
    const display = getBearDisplayData(bear);
    assert.equal(display.level, 10);
    assert.equal(display.xpProgress, 1);
    // Note: xpToNext is negative at max level due to implementation
    // currentLevelXp = 3300 - 2500 = 800
    // nextLevelXp = 0
    // xpToNext = 0 - 800 = -800
    assert.equal(display.xpToNext, -800);
  });

  it('includes accessories and mood from bear', () => {
    const bear = {
      ...baseBear,
      level: 5,
      xp: LEVEL_XP[5],
      accessories: ['scarf', 'glasses'] as AccessoryId[],
      mood: 'ecstatic' as Mood,
    };
    const display = getBearDisplayData(bear);
    assert.deepEqual(display.accessories, ['scarf', 'glasses']);
    assert.equal(display.mood, 'ecstatic');
  });

  it('includes size from bear', () => {
    const bear = { ...baseBear, level: 8, xp: LEVEL_XP[8], size: 'giant' as Size };
    const display = getBearDisplayData(bear);
    assert.equal(display.size, 'giant');
  });
});

describe('getCaveProgress', () => {
  const baseCave: Cave = {
    id: 'cave_1',
    userId: 'user_1',
    name: 'Test Cave',
    targetAmount: 1000,
    currentAmount: 0,
    theme: 'cozy',
    furniture: [],
    createdAt: Timestamp.now(),
  };

  it('returns 0 for targetAmount <= 0', () => {
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 0, currentAmount: 100 }), 0);
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: -100, currentAmount: 100 }), 0);
  });

  it('returns progress fraction for currentAmount < targetAmount', () => {
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 1000, currentAmount: 250 }), 0.25);
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 1000, currentAmount: 500 }), 0.5);
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 1000, currentAmount: 750 }), 0.75);
  });

  it('returns 1 when currentAmount >= targetAmount', () => {
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 1000, currentAmount: 1000 }), 1);
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 1000, currentAmount: 1500 }), 1);
  });

  it('returns 0 for 0 currentAmount', () => {
    assert.equal(getCaveProgress({ ...baseCave, targetAmount: 1000, currentAmount: 0 }), 0);
  });
});
