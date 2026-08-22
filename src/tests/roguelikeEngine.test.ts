import { describe, it, expect } from 'vitest';
import { mulberry32, RunManager } from '../game/RunManager';
import { AnomalyEventEngine } from '../game/AnomalyEventEngine';
import { MontyPersonalityEngine } from '../game/MontyPersonalityEngine';
import { MetaProgressionEngine } from '../game/MetaProgressionEngine';

describe('Roguelike Engine Core Tests', () => {
  it('mulberry32 PRNG produces 100% deterministic numbers for identical seed', () => {
    const seed = 849213;
    const rng1 = mulberry32(seed);
    const rng2 = mulberry32(seed);

    const sequence1 = [rng1(), rng1(), rng1(), rng1()];
    const sequence2 = [rng2(), rng2(), rng2(), rng2()];

    expect(sequence1).toEqual(sequence2);
  });

  it('RunManager calculates score breakdown and rank accurately', () => {
    const rm = new RunManager(123456);
    const scoreBreakdown = rm.calculateRunScore({
      relics: 4,
      anomalies: 5,
      damageTaken: 0,
      secrets: 1,
      montyLies: 2,
      depth: 5,
      isCursed: false,
    });

    // Score = 4*400 (1600) + 5*250 (1250) + 750 + 1*750 (750) + 2*1000 (2000) + 5*1200 (6000) = 12,350
    expect(scoreBreakdown.totalScore).toBe(12350);
    expect(scoreBreakdown.rank).toBe('VOID');
  });

  it('RunManager doubles total score in Cursed Mode', () => {
    const rm = new RunManager(123456, true);
    const normalBreakdown = rm.calculateRunScore({
      relics: 2,
      anomalies: 2,
      damageTaken: 10,
      secrets: 0,
      montyLies: 0,
      depth: 2,
      isCursed: false,
    });

    const cursedBreakdown = rm.calculateRunScore({
      relics: 2,
      anomalies: 2,
      damageTaken: 10,
      secrets: 0,
      montyLies: 0,
      depth: 2,
      isCursed: true,
    });

    expect(cursedBreakdown.totalScore).toBe(normalBreakdown.totalScore * 2);
  });

  it('AnomalyEventEngine respects anti-repetition cooldown buffer', () => {
    const engine = new AnomalyEventEngine();
    const event1 = engine.triggerEvent('ZERO_G_FLOOD');
    expect(event1.type).toBe('ZERO_G_FLOOD');
    expect(engine.recentEventsHistory).toContain('ZERO_G_FLOOD');

    engine.triggerEvent('BLACKOUT');
    engine.triggerEvent('TIME_FRACTURE');
    engine.triggerEvent('GRAVITY_FAILURE');

    // After 3 new events, ZERO_G_FLOOD should drop out of the 3-item history buffer
    expect(engine.recentEventsHistory.length).toBe(3);
    expect(engine.recentEventsHistory).not.toContain('ZERO_G_FLOOD');
  });

  it('MontyPersonalityEngine updates trust score correctly', () => {
    const monty = new MontyPersonalityEngine();
    const initialTrust = monty.profile.trustMontyScore;

    monty.recordDecision('SWITCH', true);
    expect(monty.profile.trustMontyScore).toBe(Math.min(100, initialTrust + 3));

    monty.recordDecision('STAY', false);
    expect(monty.profile.trustMontyScore).toBe(Math.max(0, initialTrust + 3 - 4));
  });

  it('MetaProgressionEngine allows purchasing upgrades with sufficient scrap', () => {
    const meta = new MetaProgressionEngine();
    meta.upgrades.oxygenCapacityLvl = 0;

    const result = meta.purchaseUpgrade('oxygenCapacityLvl', 50);
    expect(result.success).toBe(true);
    expect(result.newScrap).toBe(35); // Cost 15 scrap
    expect(meta.upgrades.oxygenCapacityLvl).toBe(1);
  });
});
