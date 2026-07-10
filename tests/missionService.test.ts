import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getMissionTarget, pickMissionForLevel } from '../src/services/missionService';
import { MissionType } from '../src/types';

describe('getMissionTarget', () => {
  describe('save_amount', () => {
    it('returns rounded target based on level', () => {
      assert.equal(getMissionTarget(1, 'save_amount'), 600); // (500+100)/100*100 = 600
      assert.equal(getMissionTarget(5, 'save_amount'), 1000); // (500+500)/100*100 = 1000
      assert.equal(getMissionTarget(10, 'save_amount'), 1500); // min(500+1000, 2000)/100*100 = 1500
    });

    it('caps at 2000 for high levels', () => {
      assert.equal(getMissionTarget(20, 'save_amount'), 2000);
      assert.equal(getMissionTarget(100, 'save_amount'), 2000);
    });
  });

  describe('round_up', () => {
    it('returns small targets based on level', () => {
      assert.equal(getMissionTarget(1, 'round_up'), 3); // min(3+0, 7) = 3
      assert.equal(getMissionTarget(2, 'round_up'), 4); // min(3+1, 7) = 4
      assert.equal(getMissionTarget(6, 'round_up'), 6); // min(3+3, 7) = 6
      assert.equal(getMissionTarget(10, 'round_up'), 7); // min(3+5, 7) = 7
    });

    it('caps at 7', () => {
      assert.equal(getMissionTarget(20, 'round_up'), 7);
    });
  });

  describe('skip_purchase', () => {
    it('returns rounded target based on level', () => {
      assert.equal(getMissionTarget(1, 'skip_purchase'), 300); // (500+100)/200*100 = 300
      assert.equal(getMissionTarget(5, 'skip_purchase'), 500); // (500+500)/200*100 = 500
      // level 10: base = min(500+1000, 2000) = 1500, round(1500/200)*100 = round(7.5)*100 = 800
      assert.equal(getMissionTarget(10, 'skip_purchase'), 800);
    });

    it('calculates correctly for level 10', () => {
      const base = Math.min(500 + 10 * 100, 2000); // 1500
      const expected = Math.round(base / 200) * 100; // 800
      assert.equal(getMissionTarget(10, 'skip_purchase'), expected);
    });
  });

  describe('custom', () => {
    it('always returns 1', () => {
      assert.equal(getMissionTarget(1, 'custom'), 1);
      assert.equal(getMissionTarget(10, 'custom'), 1);
    });
  });
});

describe('pickMissionForLevel', () => {
  it('always returns a valid mission type', () => {
    const types: MissionType[] = ['save_amount', 'round_up', 'skip_purchase', 'custom'];
    for (let level = 1; level <= 10; level++) {
      const result = pickMissionForLevel(level);
      assert.ok(types.includes(result), `Level ${level}: got invalid type ${result}`);
    }
  });

  it('distributes types roughly according to weights (statistical)', () => {
    const counts: Record<MissionType, number> = {
      save_amount: 0,
      round_up: 0,
      skip_purchase: 0,
      custom: 0,
    };

    // Run many times to check distribution
    for (let i = 0; i < 10000; i++) {
      const type = pickMissionForLevel(5);
      counts[type]++;
    }

    // save_amount should be most common (~50%)
    assert.ok(counts.save_amount > 4000 && counts.save_amount < 6000);
    // round_up and skip_purchase ~20% each
    assert.ok(counts.round_up > 1500 && counts.round_up < 3000);
    assert.ok(counts.skip_purchase > 1500 && counts.skip_purchase < 3000);
    // custom ~10%
    assert.ok(counts.custom > 500 && counts.custom < 2000);
  });

  it('increases custom weight for level >= 7', () => {
    const countsLow: Record<MissionType, number> = {
      save_amount: 0,
      round_up: 0,
      skip_purchase: 0,
      custom: 0,
    };
    const countsHigh: Record<MissionType, number> = {
      save_amount: 0,
      round_up: 0,
      skip_purchase: 0,
      custom: 0,
    };

    for (let i = 0; i < 5000; i++) {
      countsLow[pickMissionForLevel(3)]++;
      countsHigh[pickMissionForLevel(8)]++;
    }

    // Custom should be more frequent at high level
    assert.ok(countsHigh.custom > countsLow.custom);
    // round_up should also be more frequent at high level
    assert.ok(countsHigh.round_up > countsLow.round_up);
  });
});
