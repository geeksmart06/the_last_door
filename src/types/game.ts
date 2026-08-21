export type GamePhase =
  | 'START_SCREEN'
  | 'INTRO'
  | 'EXAMINE'
  | 'DOOR_SELECTION'
  | 'REVEAL'
  | 'SWITCH_DECISION'
  | 'DOOR_OPENING'
  | 'RESULT'
  | 'COMBAT'
  | 'VICTORY'
  | 'GAME_OVER';

export interface DoorState {
  id: number; // 0, 1, 2 representing doors I, II, III
  label: string; // "I", "II", "III"
  containsTreasure: boolean;
  isOpen: boolean;
  isRevealedByHost: boolean;
  isSelectedByPlayer: boolean;
  isAvailableForSwitch: boolean;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  def: number;
  round: number;
  score: number;
}

export interface MonsterState {
  name: string;
  hp: number;
  maxHp: number;
  atkMin: number;
  atkMax: number;
  spriteType: 'skeleton' | 'goblin' | 'demon';
}

export interface GameStatistics {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  stayAttempts: number;
  stayWins: number;
  switchAttempts: number;
  switchWins: number;
}

export interface SettingsConfig {
  soundEnabled: boolean;
  probabilityMode: boolean;
  crtEnabled: boolean;
}

export type DecisionChoice = 'STAY' | 'SWITCH';

export type CombatAction = 'ATTACK' | 'DEFEND' | 'RUN';
