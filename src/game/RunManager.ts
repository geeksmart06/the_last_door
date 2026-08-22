import type { LevelNumber, RunScoreBreakdown, ScoreRank } from '../types/game';

/**
 * Fast, seedable PRNG (Mulberry32).
 * Given a seed integer, returns a deterministic random float [0, 1).
 */
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRunSeed(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export class RunManager {
  public seed: number;
  public rng: () => number;
  public level: LevelNumber = 1;
  public isRunActive = false;
  public isCursed = false;
  public anomaliesSurvived = 0;
  public secretsFound = 0;
  public montyLiesDetected = 0;
  public damageTakenInRun = 0;
  public startTime = 0;

  constructor(seed = generateRunSeed(), isCursed = false) {
    this.seed = seed;
    this.rng = mulberry32(seed);
    this.isCursed = isCursed;
  }

  public startRun(seed = generateRunSeed(), isCursed = false) {
    this.seed = seed;
    this.rng = mulberry32(seed);
    this.level = 1;
    this.isRunActive = true;
    this.isCursed = isCursed;
    this.anomaliesSurvived = 0;
    this.secretsFound = 0;
    this.montyLiesDetected = 0;
    this.damageTakenInRun = 0;
    this.startTime = Date.now();
  }

  public nextRandomFloat(): number {
    return this.rng();
  }

  public nextRandomInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  public advanceLevel(): LevelNumber | null {
    if (this.level >= 5) return null;
    this.level = (this.level + 1) as LevelNumber;
    return this.level;
  }

  public calculateRunScore(stats: {
    relics: number;
    anomalies: number;
    damageTaken: number;
    secrets: number;
    montyLies: number;
    depth: LevelNumber;
    isCursed: boolean;
  }): RunScoreBreakdown {
    const relicsScore = stats.relics * 400;
    const anomaliesScore = stats.anomalies * 250;
    const noDamageBonus = stats.damageTaken === 0 ? 750 : Math.max(0, 500 - stats.damageTaken * 5);
    const secretBonus = stats.secrets * 750;
    const montyDeceptionBonus = stats.montyLies * 1000;
    const deepDescentBonus = stats.depth * 1200;

    let subtotal =
      relicsScore +
      anomaliesScore +
      noDamageBonus +
      secretBonus +
      montyDeceptionBonus +
      deepDescentBonus;

    if (stats.isCursed) {
      subtotal *= 2.0; // 2x Multiplier for Cursed Mode
    }

    const totalScore = Math.round(subtotal);

    let rank: ScoreRank = 'D';
    if (totalScore >= 8000) rank = 'VOID';
    else if (totalScore >= 6000) rank = 'S+';
    else if (totalScore >= 4500) rank = 'S';
    else if (totalScore >= 3000) rank = 'A';
    else if (totalScore >= 1800) rank = 'B';
    else if (totalScore >= 800) rank = 'C';

    return {
      relicsScore,
      anomaliesScore,
      noDamageBonus,
      secretBonus,
      montyDeceptionBonus,
      deepDescentBonus,
      totalScore,
      rank,
    };
  }
}

export const runManager = new RunManager();
