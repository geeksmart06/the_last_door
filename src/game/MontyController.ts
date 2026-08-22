import type { LevelNumber } from '../types/game';

export class MontyController {
  /**
   * Returns clean, crystal-clear readable dialogue.
   */
  public corruptText(text: string, _corruptionPct?: number): string {
    return text; // Clean readable text without garbled characters
  }

  public getIntroDialogue(level: LevelNumber, corruptionPct = 0): string {
    const dialogues: Record<LevelNumber, string> = {
      1: 'Welcome to the Orbital Airlock. Three doors stand before you. One conceals a relic; two conceal monsters. Select your target door.',
      2: 'The Centrifuge spins! Three doors orbit around the chamber. Select your target door while the room rotates.',
      3: 'Hull breach emergency! Shrapnel is flying through the debris field. Four doors block your path (A, B, C, D). Use your Magnet Boots [M] for stability!',
      4: 'Warning: Singularity detected! The Event Horizon pulls everything toward the Black Hole. Four doors orbit the void. I have an offer... for a price.',
      5: 'Quantum Core Superposition reached. Reality geometry is fracturing. Four doors flicker between states. Can you trust what I show you?',
    };

    return this.corruptText(dialogues[level], corruptionPct);
  }

  public getRevealDialogue(
    level: LevelNumber,
    revealedLabels: string[],
    isBribe: boolean,
    isFalseReveal: boolean,
    corruptionPct = 0
  ): string {
    if (isFalseReveal) {
      return this.corruptText(
        `[QUANTUM DISRUPTION] Door ${revealedLabels.join(', ')} slides open... wait! Something is wrong. Is that a relic or an illusion bait? Trust index falling...`,
        corruptionPct
      );
    }

    if (isBribe) {
      return this.corruptText(
        `A sacrifice accepted. "One little relic... that's all it costs." I have unlocked Doors ${revealedLabels.join(' and ')}! Exactly two doors remain. Your decision is now a pure 50.0% choice.`,
        corruptionPct
      );
    }

    const dialogues: Record<LevelNumber, string> = {
      1: `Interesting choice... I step forward and open Door ${revealedLabels[0] || 'I'}, revealing a monster! Now, will you STAY or SWITCH?`,
      2: `The room spins! Door ${revealedLabels[0] || 'I'} swings open showing a monster while the chamber continues rotating! STAY or SWITCH?`,
      3: `Shrapnel strikes! I reveal Door ${revealedLabels[0] || 'A'} holds a monster. With 4 doors initially, the remaining unopened doors now have a 37.5% probability each!`,
      4: `The Black Hole pulls us inward! Door ${revealedLabels[0] || 'A'} held a monster. Or would you prefer to SACRIFICE 1 RELIC for a guaranteed 50/50 reduction?`,
      5: `Quantum echoes resonate. Door ${revealedLabels[0] || 'A'} revealed a monster. But in this superposition core, reality itself is shifting...`,
    };

    return this.corruptText(dialogues[level], corruptionPct);
  }

  public getBribeOfferDialogue(relicCount: number): string {
    if (relicCount < 1) {
      return 'MONTY\'S OFFER: You need at least 1 Relic to bribe me to reveal 2 monster doors!';
    }
    return 'MONTY\'S OFFER: Sacrifice 1 Relic, and I will open 2 monster doors, reducing your final choice to a 50.0% decision!';
  }
}

export const montyController = new MontyController();
