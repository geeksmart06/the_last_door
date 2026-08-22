import type { LevelNumber, PlayerBehaviorProfile, PlayerResources } from '../types/game';
import { dialogueManager } from './DialogueManager';

const MONTY_MEMORY_KEY = 'three_doors_monty_behavior_profile_v2';

const DEFAULT_PROFILE: PlayerBehaviorProfile = {
  timesSwitched: 0,
  timesStayed: 0,
  doorsChosen: 0,
  relicsSacrificed: 0,
  anomaliesEntered: 0,
  anomaliesAvoided: 0,
  runsCompleted: 0,
  runsDied: 0,
  trustMontyScore: 50,
  riskTolerance: 'BALANCED',
};

export interface RiskRewardOffer {
  id: string;
  title: string;
  gainDescription: string;
  penaltyDescription: string;
  applyGain: (res: PlayerResources) => PlayerResources;
  applyPenalty: (res: PlayerResources) => PlayerResources;
}

export class MontyPersonalityEngine {
  public profile: PlayerBehaviorProfile = this.loadProfile();

  /**
   * Calculates Host trust percentage decaying from Level 1 (100%) down to Level 5 (35%).
   */
  public getMontyTrustLevel(level: LevelNumber): number {
    switch (level) {
      case 1:
        return 100;
      case 2:
        return 90;
      case 3:
        return 75;
      case 4:
        return 55;
      case 5:
        return 35;
      default:
        return 100;
    }
  }

  public loadProfile(): PlayerBehaviorProfile {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return DEFAULT_PROFILE;
      const data = localStorage.getItem(MONTY_MEMORY_KEY);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public saveProfile() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      localStorage.setItem(MONTY_MEMORY_KEY, JSON.stringify(this.profile));
    } catch (err) {
      console.warn('Failed to save Monty profile', err);
    }
  }

  public recordDecision(choice: 'STAY' | 'SWITCH' | 'BRIBE', followedHostTip: boolean) {
    this.profile.doorsChosen += 1;

    if (choice === 'SWITCH') {
      this.profile.timesSwitched += 1;
    } else if (choice === 'STAY') {
      this.profile.timesStayed += 1;
    } else if (choice === 'BRIBE') {
      this.profile.relicsSacrificed += 1;
    }

    if (followedHostTip) {
      this.profile.trustMontyScore = Math.min(100, this.profile.trustMontyScore + 3);
    } else {
      this.profile.trustMontyScore = Math.max(0, this.profile.trustMontyScore - 4);
    }

    const total = this.profile.timesSwitched + this.profile.timesStayed;
    if (total > 5) {
      const switchRatio = this.profile.timesSwitched / total;
      if (switchRatio > 0.7) this.profile.riskTolerance = 'RECKLESS';
      else if (switchRatio < 0.3) this.profile.riskTolerance = 'CONSERVATIVE';
      else this.profile.riskTolerance = 'BALANCED';
    }

    this.saveProfile();
  }

  public recordRunEnd(completed: boolean) {
    if (completed) {
      this.profile.runsCompleted += 1;
    } else {
      this.profile.runsDied += 1;
    }
    this.saveProfile();
  }

  public getContextualDialogue(level: LevelNumber): string {
    const totalRuns = this.profile.runsCompleted + this.profile.runsDied;

    // Rare Monty limitation / anomaly interjection (10% chance)
    if (Math.random() < 0.1) {
      return dialogueManager.getMontyLimitationLine();
    }

    if (totalRuns > 0 && level === 1 && Math.random() < 0.3) {
      return dialogueManager.validateUtf8Text(
        `Run #${totalRuns + 1}. You're back. Take your time... the left door is usually safe.`
      );
    }

    if (level === 5) {
      return dialogueManager.validateUtf8Text(
        `Level 5. You really shouldn't stop asking questions. We've had this conversation before... you don't remember, do you?`
      );
    }

    return dialogueManager.getLevelIntroDialogue(level);
  }

  public generateRiskRewardOffer(level: LevelNumber, res: PlayerResources): RiskRewardOffer | null {
    if (level < 2) return null;

    const offers: RiskRewardOffer[] = [
      {
        id: 'OXYGEN_FOR_RELICS',
        title: "MONTY'S BARGAIN: OXYGEN DRAIN",
        gainDescription: '+3 RELICS SECURED',
        penaltyDescription: '-40% OXYGEN CAPACITY',
        applyGain: (p) => ({ ...p, relics: p.relics + 3 }),
        applyPenalty: (p) => ({ ...p, oxygen: Math.max(10, p.oxygen - 40) }),
      },
      {
        id: 'HP_FOR_SCORE',
        title: "MONTY'S BARGAIN: BLOOD FOR DATA",
        gainDescription: '+1200 BONUS SCORE',
        penaltyDescription: '-35 SUIT HP DAMAGE',
        applyGain: (p) => ({ ...p, score: p.score + 1200 }),
        applyPenalty: (p) => ({ ...p, suitIntegrity: Math.max(10, p.suitIntegrity - 35) }),
      },
      {
        id: 'RELIC_FOR_REFILL',
        title: "MONTY'S BARGAIN: SACRED REPAIR",
        gainDescription: 'FULL SUIT & OXYGEN REFILL',
        penaltyDescription: 'LOSE 1 RELIC',
        applyGain: (p) => ({ ...p, suitIntegrity: p.maxSuitIntegrity, oxygen: 100 }),
        applyPenalty: (p) => ({ ...p, relics: Math.max(0, p.relics - 1) }),
      },
    ];

    const available = offers.filter((o) => {
      if (o.id === 'RELIC_FOR_REFILL' && res.relics < 1) return false;
      return true;
    });

    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }
}

export const montyPersonalityEngine = new MontyPersonalityEngine();
