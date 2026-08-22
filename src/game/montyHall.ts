import type { DoorState } from '../types/game';

export interface RoundSetup {
  treasureIndex: number;
  doors: DoorState[];
}

/**
 * Initializes a new round of 3 doors.
 * Exactly 1 door hides the treasure; 2 doors hide monsters.
 */
export function initializeRound(forcedTreasureIndex?: number): RoundSetup {
  const treasureIndex =
    typeof forcedTreasureIndex === 'number'
      ? forcedTreasureIndex
      : Math.floor(Math.random() * 3);

  const doors: DoorState[] = [0, 1, 2].map((id) => ({
    id,
    label: id === 0 ? 'I' : id === 1 ? 'II' : 'III',
    containsTreasure: id === treasureIndex,
    isOpen: false,
    isRevealedByHost: false,
    isSelectedByPlayer: false,
    isAvailableForSwitch: false,
    probabilityPct: 33.3,
  }));

  return {
    treasureIndex,
    doors,
  };
}

/**
 * The Host (Old Mysterious Man) reveals one losing door.
 * RULE 1: Host NEVER reveals the player's selected door.
 * RULE 2: Host NEVER reveals the door containing the treasure.
 */
export function selectHostRevealDoor(
  treasureIndex: number,
  playerInitialChoice: number
): number {
  const eligibleDoors = [0, 1, 2].filter(
    (index) => index !== playerInitialChoice && index !== treasureIndex
  );

  if (eligibleDoors.length === 0) {
    throw new Error('No eligible door for host to reveal - invalid state');
  }

  // If there are two options (when player picked treasure), pick randomly between them
  const selectedIndex = Math.floor(Math.random() * eligibleDoors.length);
  return eligibleDoors[selectedIndex];
}

/**
 * Returns the index of the door available if the player decides to SWITCH.
 */
export function getSwitchDoorIndex(
  playerInitialChoice: number,
  hostRevealedIndex: number
): number {
  return 3 - playerInitialChoice - hostRevealedIndex;
}

/**
 * Simulates a full round of Monty Hall game for empirical testing.
 */
export function simulateRound(shouldSwitch: boolean): {
  won: boolean;
  treasureIndex: number;
  initialChoice: number;
  hostRevealedIndex: number;
  finalChoice: number;
} {
  const treasureIndex = Math.floor(Math.random() * 3);
  const initialChoice = Math.floor(Math.random() * 3);

  const hostRevealedIndex = selectHostRevealDoor(treasureIndex, initialChoice);
  const switchDoorIndex = getSwitchDoorIndex(initialChoice, hostRevealedIndex);

  const finalChoice = shouldSwitch ? switchDoorIndex : initialChoice;
  const won = finalChoice === treasureIndex;

  return {
    won,
    treasureIndex,
    initialChoice,
    hostRevealedIndex,
    finalChoice,
  };
}
