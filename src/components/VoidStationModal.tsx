import React, { useState } from 'react';
import type { MetaUpgrades, RelicItem, LeaderboardEntry } from '../types/game';
import { metaProgressionEngine } from '../game/MetaProgressionEngine';

interface VoidStationModalProps {
  upgrades: MetaUpgrades;
  relics: RelicItem[];
  leaderboards: LeaderboardEntry[];
  scrap: number;
  isCursedMode: boolean;
  onToggleCursedMode: (val: boolean) => void;
  onPurchaseUpgrade: (key: keyof MetaUpgrades) => void;
  onStartRun: () => void;
}

export const VoidStationModal: React.FC<VoidStationModalProps> = ({
  upgrades,
  relics,
  leaderboards,
  scrap,
  isCursedMode,
  onToggleCursedMode,
  onPurchaseUpgrade,
  onStartRun,
}) => {
  const [activeTab, setActiveTab] = useState<'UPGRADES' | 'RELICS' | 'LEADERBOARD'>('UPGRADES');

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50 font-pixel">
      <div className="bg-slate-900 border-4 border-cyan-500 rounded-xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Hub Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
          <div>
            <div className="text-cyan-400 text-xs tracking-widest uppercase font-mono">
              PERSISTENT OPERATIONAL HUB
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-wider">
              🌌 VOID STATION 01
            </h2>
          </div>

          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-400">SCRAP RESERVES:</span>
            <span className="text-amber-400 font-bold font-mono text-base">⚙️ {scrap}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('UPGRADES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'UPGRADES'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ META UPGRADES
          </button>
          <button
            onClick={() => setActiveTab('RELICS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'RELICS'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💎 RELIC ARCHIVE ({relics.filter((r) => r.discovered).length}/{relics.length})
          </button>
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'LEADERBOARD'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 LEADERBOARDS
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
          {activeTab === 'UPGRADES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* OXYGEN CAPACITY */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-slate-200 font-bold text-xs">🫁 OXYGEN CAPACITY</div>
                  <div className="text-slate-400 text-[10px]">Level {upgrades.oxygenCapacityLvl} (+15 Max O2 per level)</div>
                </div>
                <button
                  onClick={() => onPurchaseUpgrade('oxygenCapacityLvl')}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-300 font-bold text-xs rounded"
                >
                  ⚙️ {metaProgressionEngine.getUpgradeCost('oxygenCapacityLvl')}
                </button>
              </div>

              {/* SUIT ARMOR */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-slate-200 font-bold text-xs">🛡️ SUIT ARMOR</div>
                  <div className="text-slate-400 text-[10px]">Level {upgrades.armorLvl} (+15 Max HP per level)</div>
                </div>
                <button
                  onClick={() => onPurchaseUpgrade('armorLvl')}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-300 font-bold text-xs rounded"
                >
                  ⚙️ {metaProgressionEngine.getUpgradeCost('armorLvl')}
                </button>
              </div>

              {/* THRUSTER EFFICIENCY */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-slate-200 font-bold text-xs">🚀 THRUSTER EFFICIENCY</div>
                  <div className="text-slate-400 text-[10px]">Level {upgrades.thrusterEfficiencyLvl} (-20% thruster fuel loss)</div>
                </div>
                <button
                  onClick={() => onPurchaseUpgrade('thrusterEfficiencyLvl')}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-300 font-bold text-xs rounded"
                >
                  ⚙️ {metaProgressionEngine.getUpgradeCost('thrusterEfficiencyLvl')}
                </button>
              </div>

              {/* QUANTUM ANCHOR */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-slate-200 font-bold text-xs">⚛️ QUANTUM ANCHOR</div>
                  <div className="text-slate-400 text-[10px]">
                    {upgrades.quantumAnchorPurchased ? 'PURCHASED (Prevents 1 gravity flip/run)' : 'Nullifies 1 gravity flip per run'}
                  </div>
                </div>
                <button
                  disabled={upgrades.quantumAnchorPurchased}
                  onClick={() => onPurchaseUpgrade('quantumAnchorPurchased')}
                  className={`px-3 py-1.5 text-xs font-bold rounded ${
                    upgrades.quantumAnchorPurchased
                      ? 'bg-slate-800 text-slate-500 border border-slate-700'
                      : 'bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-300'
                  }`}
                >
                  {upgrades.quantumAnchorPurchased ? 'LOCKED' : `⚙️ ${metaProgressionEngine.getUpgradeCost('quantumAnchorPurchased')}`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'RELICS' && (
            <div className="space-y-2">
              {relics.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border text-xs ${
                    r.discovered
                      ? 'bg-slate-950 border-cyan-500/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">
                      {r.iconSymbol} {r.discovered ? r.name : '????????????'}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">{r.rarity}</span>
                  </div>
                  <p className="italic text-[11px] text-slate-400 mb-1">
                    {r.discovered ? `"${r.description}"` : 'Undiscovered relic item.'}
                  </p>
                  {r.discovered && (
                    <div className="text-[10px] font-mono text-emerald-400">BUFF: {r.effectText}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'LEADERBOARD' && (
            <div className="space-y-1.5 font-mono text-xs">
              {leaderboards.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No local run scores recorded yet. Complete or extract a run!
                </div>
              ) : (
                leaderboards.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex justify-between items-center p-2.5 bg-slate-950 rounded border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-bold">#{idx + 1}</span>
                      <span className="text-slate-200">SEED {entry.seed}</span>
                      <span className="text-cyan-400">RANK {entry.rank}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span>L0{entry.depthReached}</span>
                      <span>💎 {entry.relics}</span>
                      <span className="text-amber-300 font-bold">{entry.score} PTS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-red-400">
            <input
              type="checkbox"
              checked={isCursedMode}
              onChange={(e) => onToggleCursedMode(e.target.checked)}
              className="accent-red-500 w-4 h-4"
            />
            <span>⚠️ CURSED RUN MODE (2x Score/Rewards, 2x Anomaly Instability)</span>
          </label>

          <button
            onClick={onStartRun}
            className="py-3 px-6 bg-cyan-950 hover:bg-cyan-900 border-2 border-cyan-400 text-cyan-200 font-bold text-sm rounded-lg transition-all shadow-lg hover:shadow-cyan-900/50"
          >
            🚀 LAUNCH RUN
          </button>
        </div>
      </div>
    </div>
  );
};
