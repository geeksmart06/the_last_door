import React from 'react';
import type { PlayerResources, LevelNumber } from '../types/game';
import { LEVEL_CONFIGS } from '../game/LevelManager';

interface RepairStationModalProps {
  resources: PlayerResources;
  nextLevel: LevelNumber;
  onUpdateResources: (updated: PlayerResources) => void;
  onProceedToNextLevel: () => void;
}

export const RepairStationModal: React.FC<RepairStationModalProps> = ({
  resources,
  nextLevel,
  onUpdateResources,
  onProceedToNextLevel,
}) => {
  const nextConfig = LEVEL_CONFIGS[nextLevel];

  const handleRepairSuit = () => {
    if (resources.scrap < 8 || resources.suitIntegrity >= 100) return;
    onUpdateResources({
      ...resources,
      scrap: resources.scrap - 8,
      suitIntegrity: Math.min(100, resources.suitIntegrity + 25),
    });
  };

  const handleRefuelThrusters = () => {
    if (resources.scrap < 5 || resources.thrusterFuel >= 100) return;
    onUpdateResources({
      ...resources,
      scrap: resources.scrap - 5,
      thrusterFuel: Math.min(100, resources.thrusterFuel + 30),
    });
  };

  const handleRefillOxygen = () => {
    if (resources.scrap < 4 || resources.oxygen >= 100) return;
    onUpdateResources({
      ...resources,
      scrap: resources.scrap - 4,
      oxygen: Math.min(100, resources.oxygen + 30),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-pixel animate-fade-in">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-lg max-w-xl w-full p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="border-b border-amber-900/60 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm md:text-base font-bold text-amber-400">
              🛠️ ANOMALY REPAIR STATION — LEVEL {nextLevel}
            </h2>
            <div className="text-[10px] text-slate-400 mt-1">
              TARGET: <span className="text-cyan-300">{nextConfig.name}</span> ({nextConfig.subtitle})
            </div>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/60 px-3 py-1.5 rounded text-xs text-amber-300 font-bold">
            SCRAP: {resources.scrap}
          </div>
        </div>

        {/* Current Resources Status */}
        <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded mb-6 text-xs">
          {/* Suit Integrity */}
          <div>
            <div className="text-slate-400 text-[10px] mb-1">SUIT INTEGRITY</div>
            <div className="w-full bg-slate-800 h-3 border border-slate-700 rounded overflow-hidden mb-1">
              <div
                className="bg-red-500 h-full transition-all duration-300"
                style={{ width: `${resources.suitIntegrity}%` }}
              />
            </div>
            <div className="text-red-300 font-bold text-xs">{resources.suitIntegrity}%</div>
          </div>

          {/* Thruster Fuel */}
          <div>
            <div className="text-slate-400 text-[10px] mb-1">THRUSTER FUEL</div>
            <div className="w-full bg-slate-800 h-3 border border-slate-700 rounded overflow-hidden mb-1">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${resources.thrusterFuel}%` }}
              />
            </div>
            <div className="text-amber-300 font-bold text-xs">{resources.thrusterFuel}%</div>
          </div>

          {/* Oxygen */}
          <div>
            <div className="text-slate-400 text-[10px] mb-1">OXYGEN SUPPLY</div>
            <div className="w-full bg-slate-800 h-3 border border-slate-700 rounded overflow-hidden mb-1">
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${resources.oxygen}%` }}
              />
            </div>
            <div className="text-cyan-300 font-bold text-xs">{resources.oxygen}%</div>
          </div>
        </div>

        {/* Workbench Actions */}
        <div className="space-y-3 mb-6">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-red-400">REPAIR SUIT (+25% HP)</div>
              <div className="text-[10px] text-slate-400">Fix damaged suit integrity plates</div>
            </div>
            <button
              onClick={handleRepairSuit}
              disabled={resources.scrap < 8 || resources.suitIntegrity >= 100}
              className={`px-4 py-2 rounded text-xs font-bold border ${
                resources.scrap >= 8 && resources.suitIntegrity < 100
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-300 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              8 SCRAP
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-400">REFUEL THRUSTERS (+30%)</div>
              <div className="text-[10px] text-slate-400">Replenish RCS maneuvering thruster fuel</div>
            </div>
            <button
              onClick={handleRefuelThrusters}
              disabled={resources.scrap < 5 || resources.thrusterFuel >= 100}
              className={`px-4 py-2 rounded text-xs font-bold border ${
                resources.scrap >= 5 && resources.thrusterFuel < 100
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              5 SCRAP
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-cyan-400">REFILL OXYGEN (+30%)</div>
              <div className="text-[10px] text-slate-400">Pressurize life support oxygen tanks</div>
            </div>
            <button
              onClick={handleRefillOxygen}
              disabled={resources.scrap < 4 || resources.oxygen >= 100}
              className={`px-4 py-2 rounded text-xs font-bold border ${
                resources.scrap >= 4 && resources.oxygen < 100
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-300 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              4 SCRAP
            </button>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="text-center">
          <button
            onClick={onProceedToNextLevel}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs md:text-sm py-3 px-6 rounded border-2 border-emerald-200 shadow-xl transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>ENTER LEVEL {nextLevel}: {nextConfig.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
