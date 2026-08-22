import React from 'react';
import type { LevelNumber, PlayerResources } from '../types/game';

interface ExtractDescendModalProps {
  level: LevelNumber;
  resources: PlayerResources;
  onExtract: () => void;
  onDescend: () => void;
}

export const ExtractDescendModal: React.FC<ExtractDescendModalProps> = ({
  level,
  resources,
  onExtract,
  onDescend,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-pixel">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="text-center mb-6 border-b border-amber-500/30 pb-4">
          <div className="text-amber-400 text-xs tracking-widest uppercase mb-1">
            ANOMALY LEVEL {level} SURVIVED
          </div>
          <h2 className="text-2xl font-bold text-amber-300 tracking-wider">
            EXTRACT OR DESCEND?
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Do you cash out your secured relics now, or push deeper into reality deterioration?
          </p>
        </div>

        {/* Current Run Payload */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center text-xs">
          <div>
            <div className="text-slate-400">RELICS SECURED</div>
            <div className="text-amber-400 font-bold text-lg">💎 {resources.relics}</div>
          </div>
          <div>
            <div className="text-slate-400 font-mono">SUIT INTEGRITY</div>
            <div className="text-emerald-400 font-bold text-lg">🛡️ {Math.round(resources.suitIntegrity)}%</div>
          </div>
          <div>
            <div className="text-slate-400 font-mono">OXYGEN LEVEL</div>
            <div className="text-cyan-400 font-bold text-lg">🫁 {Math.round(resources.oxygen)}%</div>
          </div>
        </div>

        {/* Tactical Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EXTRACT BUTTON */}
          <button
            onClick={onExtract}
            className="group p-4 bg-emerald-950/60 hover:bg-emerald-900/80 border-2 border-emerald-500/80 hover:border-emerald-400 rounded-lg text-left transition-all shadow-lg hover:shadow-emerald-900/40"
          >
            <div className="flex items-center justify-between text-emerald-400 font-bold text-sm mb-1">
              <span>[ EXTRACT ]</span>
              <span>🔒 SAFE</span>
            </div>
            <p className="text-slate-300 text-xs">
              Return to Void Station. Permanently keep all secured relics, scrap, and score.
            </p>
          </button>

          {/* DESCEND BUTTON */}
          <button
            onClick={onDescend}
            className="group p-4 bg-amber-950/60 hover:bg-amber-900/80 border-2 border-amber-500/80 hover:border-amber-400 rounded-lg text-left transition-all shadow-lg hover:shadow-amber-900/40"
          >
            <div className="flex items-center justify-between text-amber-400 font-bold text-sm mb-1">
              <span>[ DESCEND ]</span>
              <span>⚡ HIGH RISK</span>
            </div>
            <p className="text-slate-300 text-xs">
              Descend to Level {Math.min(5, level + 1)}. Higher anomaly corruption, deadlier hazards, greater rewards!
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
