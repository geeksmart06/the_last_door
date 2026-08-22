import type { LevelNumber } from '../types/game';

export interface DialogueCategory {
  level1Intro: string[];
  level2Intro: string[];
  level3Intro: string[];
  level4Intro: string[];
  level5Intro: string[];
  montyLimitation: string[];
  fifthDoorWarning: string[];
  impossibleRoomText: string[];
  highTrustReveal: string[];
  lowTrustReveal: string[];
}

export const DIALOGUE_DATABASE: DialogueCategory = {
  level1Intro: [
    'Welcome to the Orbital Airlock. Three doors stand before you. One conceals a relic; two conceal monsters. Select your target door.',
    'Ah, back at Level 1. Three doors. The rules are simple. Or at least, they used to be.',
    'Take your time. The left door is usually safe... or is it?',
  ],
  level2Intro: [
    'The Centrifuge spins! Three doors orbit around the chamber. Select your target door while the room rotates.',
    'You always hesitate here. Look at the centrifugal motion. Make your pick.',
    'The room rotates, but the probability remains 33.3%. Or does it?',
  ],
  level3Intro: [
    'Hull breach emergency! Shrapnel is flying through the debris field. Four doors block your path (A, B, C, D). Use your Magnet Boots [M] for stability!',
    'Decompression active. Four doors now. I thought you would switch faster this time.',
    'Notice how the hull fractures around us? The doors don\'t align with station blueprints.',
  ],
  level4Intro: [
    'Warning: Singularity detected! The Event Horizon pulls everything toward the Black Hole. Four doors orbit the void. I have an offer... for a price.',
    'We\'ve had this conversation before, haven\'t we? You don\'t remember, do you?',
    'The Black Hole distorts gravity and telemetry. Sacrificing a Relic will force me to unlock two monster doors.',
  ],
  level5Intro: [
    'Quantum Core Superposition reached. Reality geometry is fracturing. Four doors flicker between states. Can you trust what I show you?',
    'You were never supposed to reach this level... I remember what happens next.',
    'Reality itself is tearing at the seams. Are you playing the game... or is the game playing you?',
  ],
  montyLimitation: [
    'I don\'t know. I\'ve never seen this room in station manifests.',
    '...that wasn\'t me. The doors are moving on their own.',
    'Warning: telemetry lost. Something else is altering the containment field.',
  ],
  fifthDoorWarning: [
    'Don\'t. We don\'t talk about that fifth door.',
    'I\'m serious. Do not approach Door ?.',
    'That door does not exist in probability math. Stay away from it.',
  ],
  impossibleRoomText: [
    'The room is completely silent. No music. No HUD telemetry. At the center, your duplicate stares back before dissolving into static.',
  ],
  highTrustReveal: [
    'You follow my guidance without hesitation. Wise decision... or perhaps your first mistake.',
    'I step forward and open this door, revealing a monster! Will you STAY or SWITCH?',
  ],
  lowTrustReveal: [
    'You stopped trusting my reveals. You look at me like I am the anomaly. Perhaps I am.',
    'I reveal this door holds a monster. Will you trust the 66.7% switch probability now?',
  ],
};

export class DialogueManager {
  private recentLines: string[] = [];

  /**
   * Sanitizes string ensuring 100% clean UTF-8 readable text without garbled glyphs or corruption symbols.
   */
  public validateUtf8Text(input: string): string {
    if (!input) return '';
    // Strip replacement glyphs (\uFFFD), unprintable bytes, or illegal symbols
    return input.replace(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  }

  public getLevelIntroDialogue(level: LevelNumber): string {
    const key = `level${level}Intro` as keyof DialogueCategory;
    const pool = DIALOGUE_DATABASE[key] || DIALOGUE_DATABASE.level1Intro;
    return this.selectUnusedLine(pool);
  }

  public getMontyLimitationLine(): string {
    return this.selectUnusedLine(DIALOGUE_DATABASE.montyLimitation);
  }

  public getFifthDoorWarningLine(): string {
    return this.selectUnusedLine(DIALOGUE_DATABASE.fifthDoorWarning);
  }

  private selectUnusedLine(pool: string[]): string {
    const available = pool.filter((line) => !this.recentLines.includes(line));
    const targetPool = available.length > 0 ? available : pool;
    const selected = targetPool[Math.floor(Math.random() * targetPool.length)];

    this.recentLines.push(selected);
    if (this.recentLines.length > 6) {
      this.recentLines.shift();
    }

    return this.validateUtf8Text(selected);
  }
}

export const dialogueManager = new DialogueManager();
