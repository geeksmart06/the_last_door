import { describe, it, expect } from 'vitest';
import {
  initializeRound,
  selectHostRevealDoor,
  getSwitchDoorIndex,
  simulateRound,
} from '../game/montyHall';

describe('Monty Hall Logic Verification', () => {
  it('should initialize a round with exactly ONE treasure door and TWO monster doors', () => {
    for (let i = 0; i < 100; i++) {
      const { doors } = initializeRound();
      expect(doors).toHaveLength(3);
      const treasureCount = doors.filter((d) => d.containsTreasure).length;
      expect(treasureCount).toBe(1);
    }
  });

  it('should NEVER reveal the treasure door or the player selected door', () => {
    for (let treasureIndex = 0; treasureIndex < 3; treasureIndex++) {
      for (let playerChoice = 0; playerChoice < 3; playerChoice++) {
        for (let iter = 0; iter < 50; iter++) {
          const hostReveal = selectHostRevealDoor(treasureIndex, playerChoice);

          // Rule 1: Host never reveals player's selected door
          expect(hostReveal).not.toBe(playerChoice);

          // Rule 2: Host never reveals the treasure door
          expect(hostReveal).not.toBe(treasureIndex);

          // Host revealed door must be in range [0, 1, 2]
          expect([0, 1, 2]).toContain(hostReveal);
        }
      }
    }
  });

  it('should correctly compute the available switch door', () => {
    // If player picks 0, host reveals 2 -> switch door is 1
    expect(getSwitchDoorIndex(0, 2)).toBe(1);
    // If player picks 1, host reveals 0 -> switch door is 2
    expect(getSwitchDoorIndex(1, 0)).toBe(2);
    // If player picks 2, host reveals 1 -> switch door is 0
    expect(getSwitchDoorIndex(2, 1)).toBe(0);
  });

  it('10,000-ROUND SIMULATION: STAY strategy win rate should approach ~33.3%', () => {
    const TOTAL_RUNS = 10000;
    let wins = 0;

    for (let i = 0; i < TOTAL_RUNS; i++) {
      const result = simulateRound(false); // stay
      if (result.won) {
        wins++;
      }
    }

    const winRate = wins / TOTAL_RUNS;
    console.log(`STAY Strategy: ${wins}/${TOTAL_RUNS} wins (${(winRate * 100).toFixed(2)}%)`);

    // Mathematically expected: 33.33%. Allow 30.5% - 36.0% range for 10k sample variance
    expect(winRate).toBeGreaterThanOrEqual(0.305);
    expect(winRate).toBeLessThanOrEqual(0.365);
  });

  it('10,000-ROUND SIMULATION: SWITCH strategy win rate should approach ~66.7%', () => {
    const TOTAL_RUNS = 10000;
    let wins = 0;

    for (let i = 0; i < TOTAL_RUNS; i++) {
      const result = simulateRound(true); // switch
      if (result.won) {
        wins++;
      }
    }

    const winRate = wins / TOTAL_RUNS;
    console.log(`SWITCH Strategy: ${wins}/${TOTAL_RUNS} wins (${(winRate * 100).toFixed(2)}%)`);

    // Mathematically expected: 66.67%. Allow 63.5% - 69.5% range for 10k sample variance
    expect(winRate).toBeGreaterThanOrEqual(0.635);
    expect(winRate).toBeLessThanOrEqual(0.695);
  });
});
