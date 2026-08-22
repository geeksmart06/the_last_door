import type {
  LeaderboardEntry,
  MetaUpgrades,
  RelicItem,
} from '../types/game';

const META_UPGRADES_KEY = 'three_doors_meta_upgrades_v2';
const RELIC_ARCHIVE_KEY = 'three_doors_relic_archive_v2';
const LEADERBOARD_KEY = 'three_doors_leaderboard_v2';

const DEFAULT_UPGRADES: MetaUpgrades = {
  oxygenCapacityLvl: 0,
  armorLvl: 0,
  thrusterEfficiencyLvl: 0,
  probabilityScannerLvl: 0,
  quantumAnchorPurchased: false,
  repairKitLvl: 0,
};

export const INITIAL_RELIC_CATALOG: RelicItem[] = [
  {
    id: 'relic_01',
    name: 'THE IMPOSSIBLE KEY',
    rarity: 'RARE',
    description: 'A key forged from non-Euclidean geometry.',
    lore: 'Recovered from an airlock chamber that officially never existed on station manifests.',
    discovered: true,
    effectText: '+10% Scrap scavenged per level.',
    iconSymbol: '🔑',
  },
  {
    id: 'relic_02',
    name: 'CHRONOS PENDULUM',
    rarity: 'UNCOMMON',
    description: 'Swings continuously without air movement.',
    lore: 'Discovered in Level 2 centrifuge wreckage. Its period remains exactly 1.000 seconds regardless of gravity.',
    discovered: false,
    effectText: 'Slowing temporal decay.',
    iconSymbol: '⏱️',
  },
  {
    id: 'relic_03',
    name: 'SINGULARITY PRISM',
    rarity: 'RARE',
    description: 'Refracts black hole gravity into visible purple light.',
    lore: 'Retrieved from the accretion boundary of Event Horizon. Warm to the touch.',
    discovered: false,
    effectText: '-15% Black hole gravitational attraction force.',
    iconSymbol: '💎',
  },
  {
    id: 'relic_04',
    name: 'QUANTUM COMPASS',
    rarity: 'VERY_RARE',
    description: 'Needle spins endlessly until pointed at probability anomalies.',
    lore: 'Belonged to Commander Vance before his EVA suit telemetry was lost in 2079.',
    discovered: false,
    effectText: 'Reveals False Host deception warnings in Level 5.',
    iconSymbol: '🧩',
  },
  {
    id: 'relic_05',
    name: 'CORRUPTED MEMORY CARD',
    rarity: 'COMMON',
    description: 'An old 256MB flash drive containing static and voice logs.',
    lore: 'Audio log #41: "Monty keeps telling us to switch doors... but the doors are moving..."',
    discovered: false,
    effectText: '+150 Bonus Run Score.',
    iconSymbol: '💾',
  },
  {
    id: 'relic_06',
    name: 'NULL-G FLUID CAPACITOR',
    rarity: 'UNCOMMON',
    description: 'Contains liquid mercury floating in perfect spheres.',
    lore: 'Used in early orbital station stabilizer thrusters.',
    discovered: false,
    effectText: '+20% Thruster fuel capacity.',
    iconSymbol: '🧪',
  },
  {
    id: 'relic_07',
    name: 'MONTY\'S GOLDEN MONOCLE',
    rarity: 'IMPOSSIBLE',
    description: 'A polished brass eyepiece with a cracked lens.',
    lore: 'Found at the exact center of an Impossible Room. It smells of ozone and tobacco.',
    discovered: false,
    effectText: '+1000 Bonus Run Score rank points.',
    iconSymbol: '🧐',
  },
];

export class MetaProgressionEngine {
  public upgrades: MetaUpgrades = this.loadUpgrades();
  public relics: RelicItem[] = this.loadRelics();
  public leaderboards: LeaderboardEntry[] = this.loadLeaderboard();
  public persistentScrap = 0;

  public loadUpgrades(): MetaUpgrades {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return DEFAULT_UPGRADES;
      const data = localStorage.getItem(META_UPGRADES_KEY);
      return data ? { ...DEFAULT_UPGRADES, ...JSON.parse(data) } : DEFAULT_UPGRADES;
    } catch {
      return DEFAULT_UPGRADES;
    }
  }

  public saveUpgrades() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      localStorage.setItem(META_UPGRADES_KEY, JSON.stringify(this.upgrades));
    } catch (err) {
      console.warn('Failed to save upgrades', err);
    }
  }

  public loadRelics(): RelicItem[] {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return INITIAL_RELIC_CATALOG;
      const data = localStorage.getItem(RELIC_ARCHIVE_KEY);
      if (!data) return INITIAL_RELIC_CATALOG;
      const savedMap: Record<string, boolean> = JSON.parse(data);
      return INITIAL_RELIC_CATALOG.map((r) => ({
        ...r,
        discovered: savedMap[r.id] ?? r.discovered,
      }));
    } catch {
      return INITIAL_RELIC_CATALOG;
    }
  }

  public saveRelics() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      const map: Record<string, boolean> = {};
      this.relics.forEach((r) => {
        map[r.id] = r.discovered;
      });
      localStorage.setItem(RELIC_ARCHIVE_KEY, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to save relic archive', err);
    }
  }

  public discoverNewRelic(): RelicItem | null {
    const undiscovered = this.relics.filter((r) => !r.discovered);
    if (undiscovered.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * undiscovered.length);
    const item = undiscovered[randomIndex];
    item.discovered = true;
    this.saveRelics();
    return item;
  }

  public loadLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addLeaderboardEntry(entry: LeaderboardEntry) {
    this.leaderboards.push(entry);
    this.leaderboards.sort((a, b) => b.score - a.score);
    this.leaderboards = this.leaderboards.slice(0, 10); // Keep top 10
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(this.leaderboards));
    } catch (err) {
      console.warn('Failed to save leaderboard', err);
    }
  }

  public getUpgradeCost(upgradeKey: keyof MetaUpgrades): number {
    switch (upgradeKey) {
      case 'oxygenCapacityLvl':
        return (this.upgrades.oxygenCapacityLvl + 1) * 15;
      case 'armorLvl':
        return (this.upgrades.armorLvl + 1) * 20;
      case 'thrusterEfficiencyLvl':
        return (this.upgrades.thrusterEfficiencyLvl + 1) * 18;
      case 'probabilityScannerLvl':
        return (this.upgrades.probabilityScannerLvl + 1) * 25;
      case 'repairKitLvl':
        return (this.upgrades.repairKitLvl + 1) * 12;
      case 'quantumAnchorPurchased':
        return 50;
      default:
        return 15;
    }
  }

  public purchaseUpgrade(upgradeKey: keyof MetaUpgrades, currentScrap: number): { success: boolean; newScrap: number } {
    const cost = this.getUpgradeCost(upgradeKey);
    if (currentScrap < cost) return { success: false, newScrap: currentScrap };

    if (upgradeKey === 'quantumAnchorPurchased') {
      if (this.upgrades.quantumAnchorPurchased) return { success: false, newScrap: currentScrap };
      this.upgrades.quantumAnchorPurchased = true;
    } else {
      (this.upgrades[upgradeKey] as number) += 1;
    }

    this.saveUpgrades();
    return { success: true, newScrap: currentScrap - cost };
  }
}

export const metaProgressionEngine = new MetaProgressionEngine();
