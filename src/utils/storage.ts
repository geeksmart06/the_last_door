import type { GameStatistics, SettingsConfig } from '../types/game';

const STATS_KEY = 'three_doors_game_stats_v1';
const SETTINGS_KEY = 'three_doors_game_settings_v1';

const DEFAULT_STATS: GameStatistics = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  stayAttempts: 0,
  stayWins: 0,
  switchAttempts: 0,
  switchWins: 0,
  bribesAccepted: 0,
  falseHostSurvivals: 0,
  deepestLevel: 1,
  highestScore: 0,
  relicsFound: 0,
  impossibleRoomsFound: 0,
};

const DEFAULT_SETTINGS: SettingsConfig = {
  soundEnabled: true,
  probabilityMode: true,
  crtEnabled: true,
};

export function loadStatistics(): GameStatistics {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStatistics(stats: GameStatistics): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats to localStorage', err);
  }
}

export function updateStatsOnGameEnd(
  isSwitch: boolean,
  won: boolean
): GameStatistics {
  const stats = loadStatistics();

  stats.totalGames += 1;
  if (won) {
    stats.totalWins += 1;
  } else {
    stats.totalLosses += 1;
  }

  if (isSwitch) {
    stats.switchAttempts += 1;
    if (won) stats.switchWins += 1;
  } else {
    stats.stayAttempts += 1;
    if (won) stats.stayWins += 1;
  }

  saveStatistics(stats);
  return stats;
}

export function resetStatistics(): GameStatistics {
  saveStatistics(DEFAULT_STATS);
  return DEFAULT_STATS;
}

export function loadSettings(): SettingsConfig {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SettingsConfig): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage', err);
  }
}
