import type { DoorState, LevelNumber } from '../types/game';

export interface ProbabilityCalculation {
  initialPickProbPct: number;
  revealedDoorIndices: number[];
  remainingDoorProbabilities: Record<number, number>; // doorIndex -> probPct
  isBribe: boolean;
  isFalseReveal: boolean;
  explanation: string;
}

/**
 * Initializes doors for any level given a door count (3 or 4).
 */
export function initializeLevelDoors(
  doorCount: number,
  forcedTreasureIndex?: number
): { doors: DoorState[]; treasureIndex: number } {
  const treasureIndex =
    typeof forcedTreasureIndex === 'number'
      ? forcedTreasureIndex
      : Math.floor(Math.random() * doorCount);

  const labels = doorCount === 3 ? ['I', 'II', 'III'] : ['A', 'B', 'C', 'D'];
  const initialProbPct = Math.round((100 / doorCount) * 10) / 10;

  const doors: DoorState[] = Array.from({ length: doorCount }, (_, id) => ({
    id,
    label: labels[id] || `Door ${id + 1}`,
    containsTreasure: id === treasureIndex,
    isOpen: false,
    isRevealedByHost: false,
    isSelectedByPlayer: false,
    isAvailableForSwitch: false,
    probabilityPct: initialProbPct,
  }));

  return { doors, treasureIndex };
}

/**
 * Calculates Host reveals and dynamic probabilities according to level rules.
 */
export function calculateHostRevealAndProbabilities(params: {
  level: LevelNumber;
  doorCount: number;
  treasureIndex: number;
  playerChoiceIndex: number;
  isBribeAccepted?: boolean;
}): ProbabilityCalculation {
  const { level, doorCount, treasureIndex, playerChoiceIndex, isBribeAccepted = false } = params;

  // Level 5 False Host Deception Check (33% chance to reveal actual treasure as bait)
  const isFalseReveal = level === 5 && Math.random() < 0.33;

  const allIndices = Array.from({ length: doorCount }, (_, i) => i);
  const unchosenIndices = allIndices.filter((i) => i !== playerChoiceIndex);
  const losingUnchosenIndices = unchosenIndices.filter((i) => i !== treasureIndex);

  let revealedDoorIndices: number[] = [];
  let remainingDoorProbabilities: Record<number, number> = {};

  if (isFalseReveal && level === 5) {
    // FALSE HOST: Host intentionally reveals the treasure door as deceptive bait!
    revealedDoorIndices = [treasureIndex];
    const initialProb = Math.round((100 / doorCount) * 10) / 10;
    
    allIndices.forEach((idx) => {
      remainingDoorProbabilities[idx] = idx === playerChoiceIndex ? initialProb : 0;
    });

    return {
      initialPickProbPct: initialProb,
      revealedDoorIndices,
      remainingDoorProbabilities,
      isBribe: false,
      isFalseReveal: true,
      explanation: `⚠️ PROBABILITY INTEGRITY CORRUPTED (67% Reliability). The Host revealed a non-monster door! Is it genuine or deceptive bait?`,
    };
  }

  if (doorCount === 3) {
    // LEVEL 1 & 2: CLASSIC MONTY HALL (3 Doors)
    // Eligible doors for host reveal: must NOT be player choice AND must NOT be treasure
    const eligibleForHost = losingUnchosenIndices;
    const chosenRevealIndex =
      eligibleForHost[Math.floor(Math.random() * eligibleForHost.length)];
    revealedDoorIndices = [chosenRevealIndex];

    const switchIndex = allIndices.find(
      (i) => i !== playerChoiceIndex && i !== chosenRevealIndex
    )!;

    remainingDoorProbabilities[playerChoiceIndex] = 33.3;
    remainingDoorProbabilities[switchIndex] = 66.7;
    remainingDoorProbabilities[chosenRevealIndex] = 0;

    return {
      initialPickProbPct: 33.3,
      revealedDoorIndices,
      remainingDoorProbabilities,
      isBribe: false,
      isFalseReveal: false,
      explanation: `Initial pick: 33.3%. Remaining door: 66.7% (2/3 chance).`,
    };
  }

  // DOOR COUNT = 4 (LEVEL 3, 4, 5)
  if (isBribeAccepted && level >= 4) {
    // LEVEL 4 BRIBE SYSTEM: Host reveals 2 monster doors, converting choice into 50/50!
    // Pick 2 monster doors from losingUnchosenIndices
    if (losingUnchosenIndices.length >= 2) {
      // Shuffled pick of 2 doors
      const shuffled = [...losingUnchosenIndices].sort(() => Math.random() - 0.5);
      revealedDoorIndices = [shuffled[0], shuffled[1]];
    } else {
      // If player picked a monster door, there's 1 monster door in unchosen and 1 treasure door.
      // Host reveals the 1 unchosen monster door + 1 other if available.
      revealedDoorIndices = losingUnchosenIndices;
    }

    const remainingSwitchDoor = allIndices.find(
      (i) => i !== playerChoiceIndex && !revealedDoorIndices.includes(i)
    )!;

    remainingDoorProbabilities[playerChoiceIndex] = 50.0;
    remainingDoorProbabilities[remainingSwitchDoor] = 50.0;
    revealedDoorIndices.forEach((i) => {
      remainingDoorProbabilities[i] = 0;
    });

    return {
      initialPickProbPct: 25.0,
      revealedDoorIndices,
      remainingDoorProbabilities,
      isBribe: true,
      isFalseReveal: false,
      explanation: `BRIBE ACCEPTED! Host eliminated 2 monster doors. Guaranteed 50.0% vs 50.0% decision!`,
    };
  }

  // STANDARD 4-DOOR MONTY (LEVEL 3 & 4 without Bribe)
  // Host reveals 1 monster door from losingUnchosenIndices
  const hostRevealIdx =
    losingUnchosenIndices[Math.floor(Math.random() * losingUnchosenIndices.length)];
  revealedDoorIndices = [hostRevealIdx];

  // Probability distribution:
  // Player choice remains 25.0%
  // Remaining 2 unchosen unopened doors share the remaining 75.0% equally -> 37.5% each!
  remainingDoorProbabilities[playerChoiceIndex] = 25.0;
  remainingDoorProbabilities[hostRevealIdx] = 0;

  unchosenIndices
    .filter((i) => i !== hostRevealIdx)
    .forEach((i) => {
      remainingDoorProbabilities[i] = 37.5;
    });

  return {
    initialPickProbPct: 25.0,
    revealedDoorIndices,
    remainingDoorProbabilities,
    isBribe: false,
    isFalseReveal: false,
    explanation: `Initial pick: 25.0%. Remaining 2 doors: 37.5% each (75.0% / 2).`,
  };
}

/**
 * Simulates a full round of any level for automated testing.
 */
export function simulateLevelRound(params: {
  level: LevelNumber;
  doorCount: number;
  shouldSwitch: boolean;
  isBribeAccepted?: boolean;
}): { won: boolean; probResult: ProbabilityCalculation } {
  const { level, doorCount, shouldSwitch, isBribeAccepted = false } = params;

  const treasureIndex = Math.floor(Math.random() * doorCount);
  const initialPick = Math.floor(Math.random() * doorCount);

  const probResult = calculateHostRevealAndProbabilities({
    level,
    doorCount,
    treasureIndex,
    playerChoiceIndex: initialPick,
    isBribeAccepted,
  });

  const availableSwitchDoors = Array.from({ length: doorCount }, (_, i) => i).filter(
    (i) => i !== initialPick && !probResult.revealedDoorIndices.includes(i)
  );

  let finalPick = initialPick;
  if (shouldSwitch && availableSwitchDoors.length > 0) {
    // Pick randomly among available switch doors
    finalPick =
      availableSwitchDoors[Math.floor(Math.random() * availableSwitchDoors.length)];
  }

  const won = finalPick === treasureIndex;
  return { won, probResult };
}
