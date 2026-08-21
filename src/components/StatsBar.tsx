import React from 'react';
import type { PlayerStats } from '../types/game';

interface StatsBarProps {
  player: PlayerStats;
  onOpenMenu: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ player, onOpenMenu }) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  return (
    <header className="bg-slate-900/90 border-b-2 border-amber-500/60 p-3 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg font-pixel select-none">
      {/* HP & DEF STATS */}
      <div className="flex items-center space-x-4">
        {/* HP Indicator */}
        <div className="bg-slate-950 border-2 border-red-500/80 px-3 py-1.5 rounded flex items-center space-x-2">
          <span className="text-red-500 animate-pulse text-sm">♥</span>
          <span className="text-xs text-red-200">HP:</span>
          <div className="w-24 bg-slate-800 h-3 border border-red-950 overflow-hidden relative rounded-sm">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-xs text-white">
            {player.hp}/{player.maxHp}
          </span>
        </div>

        {/* DEF Indicator */}
        <div className="bg-slate-950 border-2 border-blue-500/80 px-3 py-1.5 rounded flex items-center space-x-2">
          <span className="text-blue-400 text-sm">🛡</span>
          <span className="text-xs text-blue-200">DEF:</span>
          <span className="text-xs text-amber-300 font-bold">{player.def}</span>
        </div>
      </div>

      {/* ROUND & SCORE */}
      <div className="flex items-center space-x-6">
        <div className="text-xs">
          <span className="text-amber-400/80">ROUND: </span>
          <span className="text-amber-300 font-bold">{player.round}</span>
        </div>
        <div className="text-xs">
          <span className="text-emerald-400/80">SCORE: </span>
          <span className="text-emerald-300 font-bold">{player.score}</span>
        </div>

        {/* MENU BUTTON */}
        <button
          onClick={onOpenMenu}
          className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold text-xs px-3 py-1.5 rounded border border-amber-300 shadow transition-colors"
        >
          [MENU]
        </button>
      </div>
    </header>
  );
};
