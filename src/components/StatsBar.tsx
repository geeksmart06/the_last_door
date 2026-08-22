import React from 'react';
import type { PlayerResources } from '../types/game';

interface StatsBarProps {
  resources: PlayerResources;
  corruptionPct: number;
  onOpenMenu: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  resources,
  corruptionPct,
  onOpenMenu,
}) => {
  const hpPercent = Math.max(0, Math.min(100, resources.suitIntegrity));
  const oxPercent = Math.max(0, Math.min(100, resources.oxygen));
  const fuelPercent = Math.max(0, Math.min(100, resources.thrusterFuel));
  const anomalyStability = Math.max(0, 100 - corruptionPct);

  return (
    <header className="bg-slate-900/95 border-b-2 border-amber-500/60 p-2.5 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg font-pixel select-none">
      {/* LEVEL & STABILITY */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="bg-amber-500/20 border border-amber-500/80 px-2.5 py-1 rounded text-amber-300 font-bold">
          LVL 0{resources.currentLevel}
        </div>
        <div className="text-[11px]">
          <span className="text-slate-400">STABILITY: </span>
          <span
            className={`font-bold ${
              anomalyStability > 60
                ? 'text-emerald-400'
                : anomalyStability > 30
                ? 'text-amber-400'
                : 'text-red-400 animate-pulse'
            }`}
          >
            {anomalyStability}%
          </span>
        </div>
      </div>

      {/* PERSISTENT RESOURCE METRICS */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* SUIT INTEGRITY (HP) */}
        <div className="bg-slate-950 border border-red-500/80 px-2.5 py-1 rounded flex items-center space-x-1.5">
          <span className="text-red-500 text-xs">♥</span>
          <span className="text-[10px] text-red-200">SUIT:</span>
          <div className="w-16 bg-slate-800 h-2.5 border border-red-950 overflow-hidden relative rounded-sm">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-white">{resources.suitIntegrity}</span>
        </div>

        {/* OXYGEN */}
        <div className="bg-slate-950 border border-cyan-500/80 px-2.5 py-1 rounded flex items-center space-x-1.5">
          <span className="text-cyan-400 text-xs">🫧</span>
          <span className="text-[10px] text-cyan-200">O2:</span>
          <div className="w-12 bg-slate-800 h-2.5 border border-cyan-950 overflow-hidden rounded-sm">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${oxPercent}%` }}
            />
          </div>
        </div>

        {/* THRUSTER FUEL */}
        <div className="bg-slate-950 border border-amber-500/80 px-2.5 py-1 rounded flex items-center space-x-1.5">
          <span className="text-amber-400 text-xs">⛽</span>
          <span className="text-[10px] text-amber-200">FUEL:</span>
          <div className="w-12 bg-slate-800 h-2.5 border border-amber-950 overflow-hidden rounded-sm">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${fuelPercent}%` }}
            />
          </div>
        </div>

        {/* RELICS & SCRAP */}
        <div className="flex items-center space-x-2 text-[11px]">
          <div className="text-emerald-400 font-bold">💎 {resources.relics}</div>
          <div className="text-amber-300 font-bold">🔧 {resources.scrap}</div>
        </div>

        {/* MENU BUTTON */}
        <button
          onClick={onOpenMenu}
          className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded border border-amber-300 shadow transition-colors"
        >
          [MENU]
        </button>
      </div>
    </header>
  );
};
