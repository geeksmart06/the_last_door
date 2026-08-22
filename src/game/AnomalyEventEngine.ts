import type { AnomalyEvent, AnomalyEventType, LevelNumber } from '../types/game';

export const ANOMALY_EVENTS: Record<AnomalyEventType, Omit<AnomalyEvent, 'isTriggered'>> = {
  ZERO_G_FLOOD: {
    type: 'ZERO_G_FLOOD',
    title: 'ZERO-G FLOOD',
    description: 'Pressurized water fills the chamber! High fluid drag. Oxygen depletion accelerated!',
    rarity: 'UNCOMMON',
    durationMs: 8000,
  },
  THE_ROOM_IS_LYING: {
    type: 'THE_ROOM_IS_LYING',
    title: 'THE ROOM IS LYING',
    description: 'Spatial disorientation! Door labels swap position dynamically. Monty says: "Don\'t worry. I remember."',
    rarity: 'RARE',
    durationMs: 10000,
  },
  TIME_FRACTURE: {
    type: 'TIME_FRACTURE',
    title: 'TIME FRACTURE',
    description: 'Chronos decay! Environmental timeline freezes while shadows shift across the room.',
    rarity: 'UNCOMMON',
    durationMs: 6000,
  },
  GRAVITY_FAILURE: {
    type: 'GRAVITY_FAILURE',
    title: 'GRAVITY FAILURE',
    description: 'Attraction field destabilizes! Rapid gravity flips (Normal -> Left -> Ceiling).',
    rarity: 'COMMON',
    durationMs: 9000,
  },
  FALSE_SIGNAL: {
    type: 'FALSE_SIGNAL',
    title: 'FALSE SIGNAL',
    description: 'Telemetry warning: OXYGEN CRITICAL EVACUATE IMMEDIATELY! (Is it real or deception?)',
    rarity: 'COMMON',
    durationMs: 5000,
  },
  BLACKOUT: {
    type: 'BLACKOUT',
    title: 'TOTAL BLACKOUT',
    description: 'Primary power failure! Only suit flashlight and emergency LEDs remain visible.',
    rarity: 'RARE',
    durationMs: 12000,
  },
  UNKNOWN_DOOR: {
    type: 'UNKNOWN_DOOR',
    title: 'UNKNOWN DOOR DETECTED',
    description: 'An extra non-standard airlock hatch materializes out of phase. Monty: "That wasn\'t there before."',
    rarity: 'VERY_RARE',
    durationMs: 15000,
  },
  IMPOSSIBLE_ROOM: {
    type: 'IMPOSSIBLE_ROOM',
    title: 'THE IMPOSSIBLE ROOM',
    description: 'Reality matrix collapses. A duplicate of your suit stares back from the void before vanishing.',
    rarity: 'IMPOSSIBLE',
    durationMs: 20000,
  },
};

export class AnomalyEventEngine {
  public activeEvent: AnomalyEvent | null = null;
  public recentEventsHistory: AnomalyEventType[] = [];

  /**
   * Evaluates and rolls an anomaly event for a level, enforcing anti-repetition cooldown.
   */
  public rollAnomalyForLevel(
    level: LevelNumber,
    rng: () => number,
    cursed = false
  ): AnomalyEvent | null {
    // Impossible room check (0.5% base, 2.0% in cursed mode)
    const impossibleChance = cursed ? 0.02 : 0.005;
    if (rng() < impossibleChance && !this.recentEventsHistory.includes('IMPOSSIBLE_ROOM')) {
      return this.triggerEvent('IMPOSSIBLE_ROOM');
    }

    // Base event trigger chance scales with level depth (20% L1 -> 75% L5)
    const triggerChance = (0.15 + level * 0.12) * (cursed ? 1.4 : 1.0);
    if (rng() > triggerChance) {
      this.activeEvent = null;
      return null;
    }

    const availableTypes = (
      Object.keys(ANOMALY_EVENTS) as AnomalyEventType[]
    ).filter((type) => type !== 'IMPOSSIBLE_ROOM' && !this.recentEventsHistory.includes(type));

    if (availableTypes.length === 0) {
      this.recentEventsHistory = []; // Reset history buffer
      return null;
    }

    const randomIndex = Math.floor(rng() * availableTypes.length);
    const selectedType = availableTypes[randomIndex];

    return this.triggerEvent(selectedType);
  }

  public triggerEvent(type: AnomalyEventType): AnomalyEvent {
    const meta = ANOMALY_EVENTS[type];
    const event: AnomalyEvent = {
      ...meta,
      isTriggered: true,
    };

    this.activeEvent = event;

    // Track history for anti-repetition (keep last 3 events)
    this.recentEventsHistory.push(type);
    if (this.recentEventsHistory.length > 3) {
      this.recentEventsHistory.shift();
    }

    return event;
  }

  public clearActiveEvent() {
    this.activeEvent = null;
  }
}

export const anomalyEventEngine = new AnomalyEventEngine();
