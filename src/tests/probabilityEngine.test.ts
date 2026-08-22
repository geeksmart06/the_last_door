import { describe, it, expect } from 'vitest';
import {
  initializeLevelDoors,
  calculateHostRevealAndProbabilities,
  simulateLevelRound,
} from '../game/ProbabilityEngine';

describe('Progressive Anomaly Probability Engine Tests', () => {
  it('Level 1 & 2 (3 Doors): Initial pick = 33.3%, Switch option = 66.7%', () => {
    const { treasureIndex } = initializeLevelDoors(3);
    const playerPick = 0;

    const calc = calculateHostRevealAndProbabilities({
      level: 1,
      doorCount: 3,
      treasureIndex,
      playerChoiceIndex: playerPick,
    });

    expect(calc.initialPickProbPct).toBe(33.3);
    expect(calc.revealedDoorIndices).toHaveLength(1);
    expect(calc.revealedDoorIndices[0]).not.toBe(playerPick);
    expect(calc.revealedDoorIndices[0]).not.toBe(treasureIndex);

    const switchIndex = [0, 1, 2].find(
      (i) => i !== playerPick && i !== calc.revealedDoorIndices[0]
    )!;
    expect(calc.remainingDoorProbabilities[playerPick]).toBe(33.3);
    expect(calc.remainingDoorProbabilities[switchIndex]).toBe(66.7);
  });

  it('Level 3 (4 Doors): Initial pick = 25.0%, Host reveals 1 monster -> 37.5% per remaining door', () => {
    const { treasureIndex } = initializeLevelDoors(4);
    const playerPick = 0;

    const calc = calculateHostRevealAndProbabilities({
      level: 3,
      doorCount: 4,
      treasureIndex,
      playerChoiceIndex: playerPick,
    });

    expect(calc.initialPickProbPct).toBe(25.0);
    expect(calc.revealedDoorIndices).toHaveLength(1);
    expect(calc.revealedDoorIndices[0]).not.toBe(playerPick);
    expect(calc.revealedDoorIndices[0]).not.toBe(treasureIndex);

    const remainingUnchosen = [0, 1, 2, 3].filter(
      (i) => i !== playerPick && i !== calc.revealedDoorIndices[0]
    );

    expect(remainingUnchosen).toHaveLength(2);
    expect(calc.remainingDoorProbabilities[playerPick]).toBe(25.0);
    expect(calc.remainingDoorProbabilities[remainingUnchosen[0]]).toBe(37.5);
    expect(calc.remainingDoorProbabilities[remainingUnchosen[1]]).toBe(37.5);
  });

  it('Level 4 Bribe System: Sacrificing 1 Relic eliminates 2 monster doors -> 50.0% / 50.0% choice', () => {
    const { treasureIndex } = initializeLevelDoors(4);
    const playerPick = 0;

    const calc = calculateHostRevealAndProbabilities({
      level: 4,
      doorCount: 4,
      treasureIndex,
      playerChoiceIndex: playerPick,
      isBribeAccepted: true,
    });

    expect(calc.isBribe).toBe(true);
    expect(calc.revealedDoorIndices.length).toBeGreaterThanOrEqual(1);

    const switchIndex = [0, 1, 2, 3].find(
      (i) => i !== playerPick && !calc.revealedDoorIndices.includes(i)
    )!;

    expect(calc.remainingDoorProbabilities[playerPick]).toBe(50.0);
    expect(calc.remainingDoorProbabilities[switchIndex]).toBe(50.0);
  });

  it('Level 5 False Host: Host can trigger a 33% deception reveal', () => {
    let falseRevealCount = 0;
    const RUNS = 1000;

    for (let i = 0; i < RUNS; i++) {
      const calc = calculateHostRevealAndProbabilities({
        level: 5,
        doorCount: 4,
        treasureIndex: 1,
        playerChoiceIndex: 0,
      });

      if (calc.isFalseReveal) {
        falseRevealCount++;
        expect(calc.revealedDoorIndices).toContain(1); // Host revealed treasure door as bait
      }
    }

    const falseRate = falseRevealCount / RUNS;
    console.log(`Level 5 False Host Rate: ${falseRevealCount}/${RUNS} (${(falseRate * 100).toFixed(1)}%)`);
    expect(falseRate).toBeGreaterThanOrEqual(0.28);
    expect(falseRate).toBeLessThanOrEqual(0.38);
  });

  it('10,000-ROUND SIMULATION: Level 3 (4-Door Monty) SWITCH win rate approaches ~37.5%', () => {
    const RUNS = 10000;
    let wins = 0;

    for (let i = 0; i < RUNS; i++) {
      const { won } = simulateLevelRound({
        level: 3,
        doorCount: 4,
        shouldSwitch: true,
      });
      if (won) wins++;
    }

    const winRate = wins / RUNS;
    console.log(`Level 3 (4-Door) SWITCH Win Rate: ${wins}/${RUNS} (${(winRate * 100).toFixed(2)}%)`);
    expect(winRate).toBeGreaterThanOrEqual(0.345);
    expect(winRate).toBeLessThanOrEqual(0.405);
  });
});
