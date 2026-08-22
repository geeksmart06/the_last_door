import React from 'react';
import type { AnomalyEventType, LevelNumber } from '../types/game';

interface DebugPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAnomaly: (type: AnomalyEventType) => void;
  onSetSuitIntegrity: (val: number) => void;
  onSetOxygen: (val: number) => void;
  onSetMontyTrust: (val: number) => void;
  onSetCorruption: (val: number) => void;
  onToggleGravity: () => void;
  onSpawnRelic: () => void;
  onSkipLevel: () => void;
  onResetRun: () => void;
  currentLevel: LevelNumber;
  corruptionPct: number;
}

export const DebugPanelModal: React.FC<DebugPanelModalProps> = ({
  isOpen,
  onClose,
  onTriggerAnomaly,
  onSetSuitIntegrity,
  onSetOxygen,
  onSetMontyTrust: _onSetMontyTrust,
  onToggleGravity,
  onSpawnRelic,
  onSkipLevel,
  onResetRun,
  currentLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 bg-slate-950/95 border-2 border-purple-500 rounded-lg p-4 shadow-2xl z-50 max-w-sm w-full font-mono text-xs text-purple-200 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-purple-500/40 pb-2 mb-3">
        <span className="font-bold text-purple-400">⚡ DEV DEBUG PANEL (CTRL+SHIFT+D)</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 font-bold"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* FORCE ANOMALY EVENTS */}
        <div>
          <div className="text-slate-400 mb-1 font-bold">FORCE ANOMALY EVENT:</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onTriggerAnomaly('ZERO_G_FLOOD')}
              className="p-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600 rounded text-left truncate"
            >
              🌊 Zero-G Flood
            </button>
            <button
              onClick={() => onTriggerAnomaly('THE_ROOM_IS_LYING')}
              className="p-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600 rounded text-left truncate"
            >
              🔄 Room Lying
            </button>
            <button
              onClick={() => onTriggerAnomaly('TIME_FRACTURE')}
              className="p-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600 rounded text-left truncate"
            >
              ⏱️ Time Fracture
            </button>
            <button
              onClick={() => onTriggerAnomaly('GRAVITY_FAILURE')}
              className="p-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600 rounded text-left truncate"
            >
              🙃 Gravity Flip
            </button>
            <button
              onClick={() => onTriggerAnomaly('BLACKOUT')}
              className="p-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600 rounded text-left truncate"
            >
              🔦 Blackout
            </button>
            <button
              onClick={() => onTriggerAnomaly('IMPOSSIBLE_ROOM')}
              className="p-1 bg-red-950/60 hover:bg-red-900/80 border border-red-500 rounded text-left text-red-300 font-bold truncate"
            >
              👁️ Impossible Room
            </button>
          </div>
        </div>

        {/* RESOURCE ADJUSTMENTS */}
        <div>
          <div className="text-slate-400 mb-1 font-bold">QUICK OVERRIDES:</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSetSuitIntegrity(100)}
              className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded"
            >
              🛡️ Refill HP (100)
            </button>
            <button
              onClick={() => onSetOxygen(100)}
              className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded"
            >
              🫁 Refill O2 (100)
            </button>
            <button
              onClick={onSpawnRelic}
              className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded"
            >
              💎 Spawn +1 Relic
            </button>
            <button
              onClick={onToggleGravity}
              className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded"
            >
              🌌 Flip Gravity
            </button>
          </div>
        </div>

        {/* CHEATS & NAVIGATION */}
        <div className="pt-2 border-t border-purple-500/30 flex justify-between">
          <button
            onClick={onSkipLevel}
            className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500 text-amber-300 rounded font-bold"
          >
            ⏩ Skip to L{Math.min(5, currentLevel + 1)}
          </button>
          <button
            onClick={onResetRun}
            className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-300 rounded font-bold"
          >
            🔄 Reset Run
          </button>
        </div>
      </div>
    </div>
  );
};
