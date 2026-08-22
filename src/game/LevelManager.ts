import type { LevelConfig, LevelNumber, PlayerResources } from '../types/game';

export const LEVEL_CONFIGS: Record<LevelNumber, LevelConfig> = {
  1: {
    level: 1,
    name: 'THE AIRLOCK',
    subtitle: 'Classic Zero-G Orbital Chamber',
    doorCount: 3,
    corruptionPct: 5,
    hasCentrifuge: false,
    hasDebris: false,
    hasBlackHole: false,
    hasQuantumGlitch: false,
    bribeAvailable: false,
    falseHostChance: 0,
  },
  2: {
    level: 2,
    name: 'THE CENTRIFUGE',
    subtitle: 'Kinetic Rotational Gravity Field',
    doorCount: 3,
    corruptionPct: 20,
    hasCentrifuge: true,
    hasDebris: false,
    hasBlackHole: false,
    hasQuantumGlitch: false,
    bribeAvailable: false,
    falseHostChance: 0,
  },
  3: {
    level: 3,
    name: 'THE DEBRIS FIELD',
    subtitle: 'High-Density Orbital Shrapnel & Decompression',
    doorCount: 4,
    corruptionPct: 40,
    hasCentrifuge: false,
    hasDebris: true,
    hasBlackHole: false,
    hasQuantumGlitch: false,
    bribeAvailable: false,
    falseHostChance: 0,
  },
  4: {
    level: 4,
    name: 'THE EVENT HORIZON',
    subtitle: 'Gravitational Collapse Singularity',
    doorCount: 4,
    corruptionPct: 70,
    hasCentrifuge: false,
    hasDebris: false,
    hasBlackHole: true,
    hasQuantumGlitch: false,
    bribeAvailable: true,
    falseHostChance: 0,
  },
  5: {
    level: 5,
    name: 'THE QUANTUM CORE',
    subtitle: 'Superposition & Reality Deterioration',
    doorCount: 4,
    corruptionPct: 100,
    hasCentrifuge: false,
    hasDebris: false,
    hasBlackHole: false,
    hasQuantumGlitch: true,
    bribeAvailable: true,
    falseHostChance: 0.33,
  },
};

export class LevelManager {
  public currentLevel: LevelNumber = 1;

  exportConfig(level: LevelNumber): LevelConfig {
    return LEVEL_CONFIGS[level];
  }

  public getNextLevel(current: LevelNumber): LevelNumber | null {
    if (current >= 5) return null;
    return (current + 1) as LevelNumber;
  }

  public calculateLevelCompleteRewards(
    won: boolean,
    level: LevelNumber,
    isSwitching: boolean
  ): { scrapEarned: number; relicsEarned: number } {
    let scrapEarned = 10 + level * 3;
    let relicsEarned = 0;

    if (won) {
      relicsEarned = 1;
      scrapEarned += 15;
    }

    if (isSwitching && won) {
      scrapEarned += 5; // Bonus scrap for mathematically smart play
    }

    return { scrapEarned, relicsEarned };
  }

  public applyInterLevelDeterioration(
    resources: PlayerResources,
    level: LevelNumber
  ): PlayerResources {
    // Oxygen & Fuel consumption scales per level
    const oxygenLoss = 10 + level * 2;
    const fuelLoss = 12 + level * 3;

    return {
      ...resources,
      oxygen: Math.max(10, resources.oxygen - oxygenLoss),
      thrusterFuel: Math.max(15, resources.thrusterFuel - fuelLoss),
      currentLevel: level,
    };
  }
}

export const levelManager = new LevelManager();
