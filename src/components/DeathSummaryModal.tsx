import React from 'react';
import type { LevelNumber, RunScoreBreakdown } from '../types/game';

interface DeathSummaryModalProps {
  scoreBreakdown: RunScoreBreakdown;
  level: LevelNumber;
  causeOfDeath: string;
  relicsRecovered: number;
  anomaliesSurvived: number;
  onReturnToStation: () => void;
  onTryAgain: () => void;
}

export const DeathSummaryModal: React.FC<DeathSummaryModalProps> = ({
  scoreBreakdown,
  level,
  causeOfDeath,
  relicsRecovered,
  anomaliesSurvived,
  onReturnToStation,
  onTryAgain,
}) => {
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'VOID':
        return 'text-purple-400 border-purple-500 bg-purple-950/60 animate-pulse';
      case 'S+':
      case 'S':
        return 'text-amber-400 border-amber-500 bg-amber-950/60';
      case 'A':
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/60';
      case 'B':
        return 'text-cyan-400 border-cyan-500 bg-cyan-950/60';
      default:
        return 'text-slate-400 border-slate-600 bg-slate-900';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-pixel">
      <div className="bg-slate-900 border-4 border-red-600/80 rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Signal Lost Header */}
        <div className="text-center mb-5 border-b border-red-600/30 pb-4">
          <div className="text-red-500 text-xs tracking-widest uppercase mb-1 font-bold animate-pulse">
            ⚠️ SIGNAL LOST — TELEMETRY DISRUPTED
          </div>
          <h2 className="text-3xl font-bold text-red-400 tracking-wider">
            SUIT FAILURE
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            CAUSE: <span className="text-slate-200 font-mono">{causeOfDeath}</span>
          </p>
        </div>

        {/* Score & Rank Banner */}
        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800 mb-5">
          <div>
            <div className="text-slate-400 text-xs">TOTAL VOID SCORE</div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {scoreBreakdown.totalScore}
            </div>
          </div>

          <div
            className={`px-4 py-2 border-2 rounded-lg text-center font-bold text-xl ${getRankColor(
              scoreBreakdown.rank
            )}`}
          >
            RANK {scoreBreakdown.rank}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-1.5 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-6 text-slate-300">
          <div className="flex justify-between">
            <span>DEPTH REACHED:</span>
            <span className="text-amber-400 font-bold">LEVEL 0{level}</span>
          </div>
          <div className="flex justify-between">
            <span>RELICS SECURED:</span>
            <span className="text-cyan-400">+{scoreBreakdown.relicsScore} ({relicsRecovered} items)</span>
          </div>
          <div className="flex justify-between">
            <span>ANOMALIES SURVIVED:</span>
            <span className="text-emerald-400">+{scoreBreakdown.anomaliesScore} ({anomaliesSurvived} events)</span>
          </div>
          <div className="flex justify-between">
            <span>DEEP DESCENT BONUS:</span>
            <span className="text-purple-400">+{scoreBreakdown.deepDescentBonus}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReturnToStation}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-bold text-xs transition-all"
          >
            [ RETURN TO HUB ]
          </button>

          <button
            onClick={onTryAgain}
            className="py-3 px-4 bg-red-950/80 hover:bg-red-900 border-2 border-red-500 rounded-lg text-red-200 font-bold text-xs transition-all shadow-lg hover:shadow-red-900/50"
          >
            [ TRY AGAIN ]
          </button>
        </div>
      </div>
    </div>
  );
};
