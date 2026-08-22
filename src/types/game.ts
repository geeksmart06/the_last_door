export type GamePhase =
  | 'START_SCREEN'
  | 'VOID_HUB'
  | 'INTRO'
  | 'DOOR_SELECTION'
  | 'REVEAL'
  | 'SWITCH_DECISION'
  | 'DOOR_OPENING'
  | 'RESULT'
  | 'COMBAT'
  | 'EXTRACT_DECISION'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'LEVEL_TRANSITION'
  | 'REPAIR_STATION';

export type LevelNumber = 1 | 2 | 3 | 4 | 5;

export interface PlayerResources {
  suitIntegrity: number; // 0-100 (HP)
  maxSuitIntegrity: number;
  oxygen: number; // 0-100
  thrusterFuel: number; // 0-100
  relics: number;
  scrap: number;
  def: number;
  score: number;
  currentLevel: LevelNumber;
  cursedMode: boolean;
}

export interface DoorState {
  id: number;
  label: string; // "I", "II", "III", "IV" / "A", "B", "C", "D"
  containsTreasure: boolean;
  isOpen: boolean;
  isRevealedByHost: boolean;
  isSelectedByPlayer: boolean;
  isAvailableForSwitch: boolean;
  probabilityPct: number; // Dynamically calculated probability (e.g. 33.3%, 66.7%, 25%, 37.5%, 50%)
  isFalseReveal?: boolean; // For Level 5 False Host deceptive reveal tag
}

export interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotationSpeed: number;
  isMagnetAnchored: boolean; // Toggleable via [M] key in Level 3+
  isGravityReversed: boolean; // Polarity inversion in Level 5
}

export interface LevelConfig {
  level: LevelNumber;
  name: string;
  subtitle: string;
  doorCount: number;
  corruptionPct: number;
  hasCentrifuge: boolean;
  hasDebris: boolean;
  hasBlackHole: boolean;
  hasQuantumGlitch: boolean;
  bribeAvailable: boolean;
  falseHostChance: number; // 0 for L1-L4, 0.33 for L5
}

export interface MonsterState {
  name: string;
  hp: number;
  maxHp: number;
  atkMin: number;
  atkMax: number;
  spriteType: 'skeleton' | 'goblin' | 'demon';
}

export type AnomalyEventType =
  | 'ZERO_G_FLOOD'
  | 'THE_ROOM_IS_LYING'
  | 'TIME_FRACTURE'
  | 'GRAVITY_FAILURE'
  | 'FALSE_SIGNAL'
  | 'BLACKOUT'
  | 'UNKNOWN_DOOR'
  | 'IMPOSSIBLE_ROOM';

export type EventRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE' | 'IMPOSSIBLE';

export interface AnomalyEvent {
  type: AnomalyEventType;
  title: string;
  description: string;
  rarity: EventRarity;
  durationMs?: number;
  isTriggered: boolean;
}

export interface RelicItem {
  id: string;
  name: string;
  rarity: EventRarity;
  description: string;
  lore: string;
  discovered: boolean;
  effectText: string;
  iconSymbol: string;
}

export interface MetaUpgrades {
  oxygenCapacityLvl: number;
  armorLvl: number;
  thrusterEfficiencyLvl: number;
  probabilityScannerLvl: number;
  quantumAnchorPurchased: boolean;
  repairKitLvl: number;
}

export interface PlayerBehaviorProfile {
  timesSwitched: number;
  timesStayed: number;
  doorsChosen: number;
  relicsSacrificed: number;
  anomaliesEntered: number;
  anomaliesAvoided: number;
  runsCompleted: number;
  runsDied: number;
  trustMontyScore: number; // 0 (Zero Trust) to 100 (Full Trust)
  riskTolerance: 'CONSERVATIVE' | 'BALANCED' | 'RECKLESS';
}

export type ScoreRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'S+' | 'VOID';

export interface RunScoreBreakdown {
  relicsScore: number;
  anomaliesScore: number;
  noDamageBonus: number;
  secretBonus: number;
  montyDeceptionBonus: number;
  deepDescentBonus: number;
  totalScore: number;
  rank: ScoreRank;
}

export interface LeaderboardEntry {
  id: string;
  seed: number;
  score: number;
  rank: ScoreRank;
  relics: number;
  depthReached: LevelNumber;
  date: string;
  cursed: boolean;
}

export interface GameStatistics {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  stayAttempts: number;
  stayWins: number;
  switchAttempts: number;
  switchWins: number;
  bribesAccepted: number;
  falseHostSurvivals: number;
  deepestLevel: LevelNumber;
  highestScore: number;
  relicsFound: number;
  impossibleRoomsFound: number;
}

export interface SettingsConfig {
  soundEnabled: boolean;
  probabilityMode: boolean;
  crtEnabled: boolean;
  devModeEnabled?: boolean;
}

export type DecisionChoice = 'STAY' | 'SWITCH' | 'BRIBE';
export type CombatAction = 'ATTACK' | 'DEFEND' | 'RUN';
