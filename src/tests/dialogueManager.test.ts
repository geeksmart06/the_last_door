import { describe, it, expect } from 'vitest';
import { DialogueManager } from '../game/DialogueManager';
import { MontyPersonalityEngine } from '../game/MontyPersonalityEngine';

describe('Dialogue Architecture & Subtitle Validator Tests', () => {
  it('validateUtf8Text strips unprintable bytes and replacement glyphs', () => {
    const manager = new DialogueManager();
    const corruptedInput = 'M\uFFFDO\uFFFDN\uFFFDT\uFFFDY: "You shouldn\'t be here."';
    const cleanOutput = manager.validateUtf8Text(corruptedInput);

    expect(cleanOutput).toBe('MONTY: "You shouldn\'t be here."');
    expect(cleanOutput).not.toContain('\uFFFD');
  });

  it('MontyPersonalityEngine decays trust level from Level 1 (100%) to Level 5 (35%)', () => {
    const monty = new MontyPersonalityEngine();

    expect(monty.getMontyTrustLevel(1)).toBe(100);
    expect(monty.getMontyTrustLevel(2)).toBe(90);
    expect(monty.getMontyTrustLevel(3)).toBe(75);
    expect(monty.getMontyTrustLevel(4)).toBe(55);
    expect(monty.getMontyTrustLevel(5)).toBe(35);
  });

  it('DialogueManager selects valid non-corrupted intro dialogues for Level 1-5', () => {
    const manager = new DialogueManager();

    for (let level = 1; level <= 5; level++) {
      const dialogue = manager.getLevelIntroDialogue(level as any);
      expect(dialogue).toBeDefined();
      expect(dialogue.length).toBeGreaterThan(10);
      expect(dialogue).not.toContain('\uFFFD');
    }
  });
});
