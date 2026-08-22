import type { MonsterState } from '../types/game';

export interface CombatPlayerStats {
  hp: number;
  maxHp: number;
  def: number;
  round: number;
  score?: number;
}

export function createMonsterForRound(round: number): MonsterState {
  const monsterTypes: Array<{
    name: string;
    spriteType: 'skeleton' | 'goblin' | 'demon';
    hpBase: number;
    atkMinBase: number;
    atkMaxBase: number;
  }> = [
    {
      name: 'Shadow Skeleton',
      spriteType: 'skeleton',
      hpBase: 45,
      atkMinBase: 10,
      atkMaxBase: 20,
    },
    {
      name: 'Dungeon Goblin',
      spriteType: 'goblin',
      hpBase: 60,
      atkMinBase: 12,
      atkMaxBase: 22,
    },
    {
      name: 'Archon Demon',
      spriteType: 'demon',
      hpBase: 80,
      atkMinBase: 15,
      atkMaxBase: 25,
    },
  ];

  const type = monsterTypes[(round - 1) % monsterTypes.length];
  const hpMultiplier = 1 + (round - 1) * 0.15;
  const hp = Math.round(type.hpBase * hpMultiplier);

  return {
    name: `${type.name} (Lvl ${round})`,
    hp,
    maxHp: hp,
    atkMin: type.atkMinBase + (round - 1),
    atkMax: type.atkMaxBase + (round - 1) * 2,
    spriteType: type.spriteType,
  };
}

export interface CombatTurnResult {
  playerHpAfter: number;
  monsterHpAfter: number;
  playerDamageDealt: number;
  monsterDamageDealt: number;
  isDefending: boolean;
  escaped: boolean;
  logMessage: string;
}

export function executePlayerAttack(
  player: CombatPlayerStats,
  monster: MonsterState
): CombatTurnResult {
  // Player damage: 15-30
  const playerDmg = Math.floor(Math.random() * 16) + 15;
  const newMonsterHp = Math.max(0, monster.hp - playerDmg);

  if (newMonsterHp === 0) {
    return {
      playerHpAfter: player.hp,
      monsterHpAfter: 0,
      playerDamageDealt: playerDmg,
      monsterDamageDealt: 0,
      isDefending: false,
      escaped: false,
      logMessage: `You strike the ${monster.name} for ${playerDmg} damage! The monster is defeated!`,
    };
  }

  // Monster counter-attacks: 10-25 mitigated by player defense
  const monsterRawDmg =
    Math.floor(Math.random() * (monster.atkMax - monster.atkMin + 1)) +
    monster.atkMin;
  // DEF mitigates damage (e.g. 20 DEF reduces damage by ~30%)
  const damageMitigation = Math.floor((player.def / 100) * monsterRawDmg);
  const monsterEffectiveDmg = Math.max(
    3,
    monsterRawDmg - Math.min(monsterRawDmg - 3, damageMitigation)
  );

  const newPlayerHp = Math.max(0, player.hp - monsterEffectiveDmg);

  return {
    playerHpAfter: newPlayerHp,
    monsterHpAfter: newMonsterHp,
    playerDamageDealt: playerDmg,
    monsterDamageDealt: monsterEffectiveDmg,
    isDefending: false,
    escaped: false,
    logMessage: `You strike for ${playerDmg} damage! The ${monster.name} hits back for ${monsterEffectiveDmg} damage!`,
  };
}

export function executePlayerDefend(
  player: CombatPlayerStats,
  monster: MonsterState
): CombatTurnResult {
  // Defending doubles defense mitigation for this turn
  const monsterRawDmg =
    Math.floor(Math.random() * (monster.atkMax - monster.atkMin + 1)) +
    monster.atkMin;
  const defBonus = player.def * 2;
  const damageMitigation = Math.floor((defBonus / 100) * monsterRawDmg);
  const monsterEffectiveDmg = Math.max(
    1,
    monsterRawDmg - Math.min(monsterRawDmg - 1, damageMitigation)
  );

  const newPlayerHp = Math.max(0, player.hp - monsterEffectiveDmg);

  return {
    playerHpAfter: newPlayerHp,
    monsterHpAfter: monster.hp,
    playerDamageDealt: 0,
    monsterDamageDealt: monsterEffectiveDmg,
    isDefending: true,
    escaped: false,
    logMessage: `You raise your shield! Damage reduced. The ${monster.name} hits for only ${monsterEffectiveDmg} damage!`,
  };
}

export function executePlayerRun(
  player: CombatPlayerStats,
  monster: MonsterState
): CombatTurnResult {
  // 50% chance to run away successfully
  const success = Math.random() < 0.5;

  if (success) {
    return {
      playerHpAfter: player.hp,
      monsterHpAfter: monster.hp,
      playerDamageDealt: 0,
      monsterDamageDealt: 0,
      isDefending: false,
      escaped: true,
      logMessage: `You managed to escape into the shadows!`,
    };
  }

  // Failed run -> monster attacks
  const monsterRawDmg =
    Math.floor(Math.random() * (monster.atkMax - monster.atkMin + 1)) +
    monster.atkMin;
  const newPlayerHp = Math.max(0, player.hp - monsterRawDmg);

  return {
    playerHpAfter: newPlayerHp,
    monsterHpAfter: monster.hp,
    playerDamageDealt: 0,
    monsterDamageDealt: monsterRawDmg,
    isDefending: false,
    escaped: false,
    logMessage: `Escape failed! The ${monster.name} strikes you for ${monsterRawDmg} damage while your back is turned!`,
  };
}
