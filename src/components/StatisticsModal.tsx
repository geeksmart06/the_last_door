import React from 'react';
import type { GameStatistics } from '../types/game';

interface StatisticsModalProps {
  stats: GameStatistics;
  onClose: () => void;
  onReset: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  stats,
  onClose,
  onReset,
}) => {
  const stayWinRate =
    stats.stayAttempts > 0
      ? ((stats.stayWins / stats.stayAttempts) * 100).toFixed(1)
      : '0.0';

  const switchWinRate =
    stats.switchAttempts > 0
      ? ((stats.switchWins / stats.switchAttempts) * 100).toFixed(1)
      : '0.0';

  const overallWinRate =
    stats.totalGames > 0
      ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none font-pixel animate-fade-in">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-lg max-w-lg w-full p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 mb-4">
          <h2 className="text-sm md:text-base font-bold text-amber-400">
            📊 MONTY HALL STATISTICS
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded border border-slate-600"
          >
            [X]
          </button>
        </div>

        {/* General Stats */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded mb-4 text-center text-xs">
          <div>
            <div className="text-slate-400 text-[10px]">GAMES</div>
            <div className="text-amber-300 font-bold text-sm mt-1">{stats.totalGames}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">VICTORIES</div>
            <div className="text-emerald-400 font-bold text-sm mt-1">{stats.totalWins}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">WIN RATE</div>
            <div className="text-cyan-300 font-bold text-sm mt-1">{overallWinRate}%</div>
          </div>
        </div>

        {/* Strategy Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* STAY STRATEGY */}
          <div className="bg-slate-950 border-2 border-slate-700 p-4 rounded text-center">
            <h3 className="text-xs font-bold text-amber-300 mb-2">🔒 STAY STRATEGY</h3>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Attempts: {stats.stayAttempts}</div>
              <div>Wins: {stats.stayWins}</div>
              <div className="text-sm font-bold text-amber-400 mt-2">
                Win Rate: {stayWinRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Expected: ~33.3%</div>
            </div>
          </div>

          {/* SWITCH STRATEGY */}
          <div className="bg-slate-950 border-2 border-emerald-500/80 p-4 rounded text-center">
            <h3 className="text-xs font-bold text-emerald-300 mb-2">🔄 SWITCH STRATEGY</h3>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Attempts: {stats.switchAttempts}</div>
              <div>Wins: {stats.switchWins}</div>
              <div className="text-sm font-bold text-emerald-400 mt-2">
                Win Rate: {switchWinRate}%
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-1">Expected: ~66.7%</div>
            </div>
          </div>
        </div>

        {/* Educational Insight Box */}
        <div className="bg-indigo-950/70 border border-indigo-500/40 p-3 rounded text-xs text-indigo-200 leading-relaxed mb-6">
          <p className="font-bold text-amber-400 mb-1">💡 Mathematical Principle:</p>
          <p className="text-[11px] font-sans">
            Switching gives you a <strong>2/3 (66.7%) chance</strong> of winning because the host always eliminates a losing door from the doors you didn't pick. Staying leaves you with your initial <strong>1/3 (33.3%) chance</strong>!
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={onReset}
            className="text-[10px] text-red-400 hover:text-red-300 bg-red-950/40 px-3 py-1.5 rounded border border-red-900"
          >
            Reset Stats
          </button>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded shadow"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
