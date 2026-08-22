import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenStats,
  onOpenSettings,
}) => {
  return (
    <div className="relative min-h-[500px] w-full bg-slate-950 rounded-lg border-4 border-amber-600/60 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none font-pixel overflow-hidden">
      {/* Background Pixel Arch & Torch Glow Aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-950/80 to-slate-950" />
      <div className="absolute -top-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      {/* Decorative Door Silhouettes */}
      <div className="relative z-10 flex space-x-6 mb-6 opacity-30">
        <div className="w-12 h-20 border-2 border-amber-500/50 rounded-t-full bg-slate-900" />
        <div className="w-14 h-24 border-2 border-amber-500 rounded-t-full bg-slate-900" />
        <div className="w-12 h-20 border-2 border-amber-500/50 rounded-t-full bg-slate-900" />
      </div>

      {/* Game Title */}
      <h1 className="relative z-10 text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_4px_10px_rgba(255,191,0,0.4)] tracking-wider mb-2">
        THE LAST DOOR
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-xs md:text-sm text-slate-300 italic font-mono mb-8 max-w-md">
        "The deeper you go, the less you can trust."
      </p>

      {/* Main Navigation Menu */}
      <div className="relative z-10 flex flex-col space-y-3 w-full max-w-xs">
        <button
          onClick={onStartGame}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-sm py-3 px-6 rounded border-2 border-amber-200 shadow-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>🗝️</span>
          <span>START GAME</span>
        </button>

        <button
          onClick={onOpenHowToPlay}
          className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-300 font-bold text-xs py-2.5 px-6 rounded border border-amber-500/60 shadow transition-all"
        >
          📜 HOW TO PLAY
        </button>

        <button
          onClick={onOpenStats}
          className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-cyan-300 font-bold text-xs py-2.5 px-6 rounded border border-cyan-500/60 shadow transition-all"
        >
          📊 STATISTICS
        </button>

        <button
          onClick={onOpenSettings}
          className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 font-bold text-xs py-2.5 px-6 rounded border border-slate-600 shadow transition-all"
        >
          ⚙️ SETTINGS
        </button>
      </div>

      {/* Footer credits */}
      <div className="relative z-10 mt-8 text-[10px] text-slate-500 font-mono">
        Inspired by the Monty Hall Problem • 8-Bit Edition
      </div>
    </div>
  );
};
