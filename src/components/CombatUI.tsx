import type { MonsterState } from '../types/game';
import type { CombatPlayerStats } from '../game/combat';

interface CombatUIProps {
  player: CombatPlayerStats;
  monster: MonsterState;
  combatLog: string;
  onAttack: () => void;
  onDefend: () => void;
  onRun: () => void;
}

export const CombatUI: React.FC<CombatUIProps> = ({
  player,
  monster,
  combatLog,
  onAttack,
  onDefend,
  onRun,
}) => {
  const monsterHpPercent = Math.max(0, Math.min(100, (monster.hp / monster.maxHp) * 100));
  const playerHpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  return (
    <div className="bg-slate-950 border-4 border-red-600 rounded-lg p-4 font-pixel select-none shadow-2xl my-2">
      {/* PLAYER & MONSTER STATUS HEADER */}
      <div className="bg-slate-900 border border-red-900/80 p-3 rounded mb-3 flex flex-wrap items-center justify-between gap-3">
        {/* Player Mini Stats */}
        <div className="flex items-center space-x-2">
          <span className="text-red-500 text-xs font-bold">HERO HP:</span>
          <div className="w-24 bg-slate-950 h-3 border border-red-900 rounded overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${playerHpPercent}%` }}
            />
          </div>
          <span className="text-xs text-white">
            {player.hp}/{player.maxHp}
          </span>
        </div>

        {/* Monster Stats */}
        <div className="flex items-center space-x-2">
          <span className="text-red-500 text-sm">👹</span>
          <span className="text-xs font-bold text-red-200">{monster.name}</span>
          <div className="w-24 bg-slate-950 h-3 border border-red-800 rounded overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${monsterHpPercent}%` }}
            />
          </div>
          <span className="text-xs text-white">
            {monster.hp}/{monster.maxHp}
          </span>
        </div>
      </div>

      {/* COMBAT LOG */}
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-xs text-amber-200 min-h-[48px] mb-4 flex items-center">
        <span>⚔️ {combatLog || 'The battle begins! Choose your action!'}</span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={onAttack}
          className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs py-3 px-4 rounded border-2 border-red-300 shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>⚔️</span>
          <span>[A] ATTACK</span>
        </button>
        <button
          onClick={onDefend}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded border-2 border-blue-300 shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>🛡️</span>
          <span>[B] DEFEND</span>
        </button>
        <button
          onClick={onRun}
          className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold text-xs py-3 px-4 rounded border-2 border-amber-300 shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>💨</span>
          <span>[C] RUN</span>
        </button>
      </div>
    </div>
  );
};
