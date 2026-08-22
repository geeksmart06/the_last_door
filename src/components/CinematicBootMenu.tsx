import React, { useState, useEffect } from 'react';

interface CinematicBootMenuProps {
  onDescend: () => void;
  onOpenArchive: () => void;
  onOpenUpgrades: () => void;
  onOpenSettings: () => void;
}

export const CinematicBootMenu: React.FC<CinematicBootMenuProps> = ({
  onDescend,
  onOpenArchive,
  onOpenUpgrades,
  onOpenSettings,
}) => {
  const [bootPhase, setBootPhase] = useState<'BLACK' | 'TERMINAL_BOOT' | 'REVEAL' | 'MENU'>('BLACK');
  const [hoveredButton, setHoveredButton] = useState<'DESCEND' | 'ARCHIVE' | 'UPGRADES' | 'SETTINGS' | null>(null);
  const [idleEventText, setIdleEventText] = useState<string | null>(null);

  // Cinematic Boot Timer (Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 Menu)
  useEffect(() => {
    const timer1 = setTimeout(() => setBootPhase('TERMINAL_BOOT'), 1000);
    const timer2 = setTimeout(() => setBootPhase('REVEAL'), 3200);
    const timer3 = setTimeout(() => setBootPhase('MENU'), 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Allow player to skip intro with any key or click
  const skipIntro = () => {
    if (bootPhase !== 'MENU') {
      setBootPhase('MENU');
    }
  };

  // Idle Events Trigger (Events A, B, C, D, E)
  useEffect(() => {
    if (bootPhase !== 'MENU') return;

    const interval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.2) {
        const events = [
          'RUN #03 — TELEMETRY DISRUPTED',
          'CREW COUNT: 01 ... CREW COUNT: 00',
          'WELCOME BACK',
          'MONTY\'S MONITOR ACTIVE [SILENT]',
          'ANOMALY CONTAINMENT FIELD DRIFT: +4.2%',
        ];
        const selected = events[Math.floor(Math.random() * events.length)];
        setIdleEventText(selected);
        setTimeout(() => setIdleEventText(null), 3000);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [bootPhase]);

  if (bootPhase === 'BLACK') {
    return (
      <div
        onClick={skipIntro}
        className="w-full min-h-[440px] bg-black flex items-center justify-center cursor-pointer rounded-lg font-pixel select-none p-6"
      >
        <div className="text-slate-700 text-xs animate-pulse font-mono">
          [ CLICK OR PRESS ANY KEY TO SKIP INTRO ]
        </div>
      </div>
    );
  }

  if (bootPhase === 'TERMINAL_BOOT') {
    return (
      <div
        onClick={skipIntro}
        className="w-full min-h-[440px] bg-slate-950 flex flex-col justify-center p-6 text-emerald-400 font-mono text-xs cursor-pointer select-none rounded-lg border-2 border-slate-800 shadow-2xl"
      >
        <div className="max-w-md mx-auto space-y-2 border border-emerald-500/30 p-6 rounded bg-slate-900/90 shadow-2xl">
          <div className="font-bold border-b border-emerald-500/40 pb-2 text-emerald-300">
            SYSTEM BOOT — ANOMALY TERMINAL v4.2
          </div>
          <div className="space-y-1 text-[11px] pt-2">
            <div>LIFE SUPPORT ......... <span className="text-emerald-300">ONLINE</span></div>
            <div>NAVIGATION ........... <span className="text-red-400">OFFLINE</span></div>
            <div>COMMUNICATION ........ <span className="text-amber-400">UNKNOWN</span></div>
            <div>HULL INTEGRITY ....... <span className="text-amber-400">41%</span></div>
            <div className="pt-2 text-red-500 font-bold tracking-wider animate-pulse">
              ANOMALY CONTAINMENT .. FAILED
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bootPhase === 'REVEAL') {
    return (
      <div
        onClick={skipIntro}
        className="w-full min-h-[440px] bg-slate-950 flex items-center justify-center p-6 cursor-pointer font-pixel rounded-lg border-2 border-slate-800 animate-fade-in"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-amber-400 font-bold text-xs tracking-widest uppercase font-mono">
            INITIALIZING SPACECRAFT TERMINAL...
          </div>
        </div>
      </div>
    );
  }

  // MAIN SPACECRAFT INTERACTIVE CONTROL TERMINAL MENU (Perfect Container Alignment)
  return (
    <div className="relative w-full min-h-[440px] bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 rounded-lg border-2 border-amber-600/40 shadow-2xl font-pixel select-none overflow-hidden crt-effect">
      {/* Background Spacecraft Interior Simulation */}
      <div className="absolute inset-0 bg-slate-900/60 pointer-events-none border-4 border-slate-900">
        {/* Hover Monitor Diagnostics Visual Responses */}
        {hoveredButton === 'DESCEND' && (
          <div className="absolute top-4 left-4 p-2.5 bg-amber-950/90 border border-amber-500 rounded text-amber-300 text-[10px] font-mono animate-pulse">
            🗺️ ANOMALY SEED MAP: ACTIVE
            <br />
            TARGET DEPTH: LEVEL 01-05
          </div>
        )}
        {hoveredButton === 'ARCHIVE' && (
          <div className="absolute top-4 right-4 p-2.5 bg-cyan-950/90 border border-cyan-500 rounded text-cyan-300 text-[10px] font-mono animate-pulse">
            💾 RECOVERED LOGS FLICKER
            <br />
            RELIC CATALOG: 7 ITEMS
          </div>
        )}
        {hoveredButton === 'UPGRADES' && (
          <div className="absolute bottom-4 left-4 p-2.5 bg-emerald-950/90 border border-emerald-500 rounded text-emerald-300 text-[10px] font-mono animate-pulse">
            🛡️ SUIT DIAGNOSTICS: 100%
            <br />
            META UPGRADES SHOP READY
          </div>
        )}
        {hoveredButton === 'SETTINGS' && (
          <div className="absolute bottom-4 right-4 p-2.5 bg-slate-950/90 border border-slate-600 rounded text-slate-300 text-[10px] font-mono animate-pulse">
            ⚙️ SYSTEM TELEMETRY OK
            <br />
            CRT SCANLINES: ENABLED
          </div>
        )}

        {/* Rare Idle Event Monitor Overlay */}
        {idleEventText && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 p-2 bg-red-950/90 border-2 border-red-500 text-red-300 font-mono text-[10px] rounded shadow-2xl animate-bounce">
            ⚠️ SYSTEM EVENT: {idleEventText}
          </div>
        )}
      </div>

      {/* Main Terminal Menu Container */}
      <div className="relative z-10 max-w-sm w-full bg-slate-900/90 border-2 border-amber-600/80 rounded-xl p-6 shadow-2xl text-center space-y-5 backdrop-blur-md">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-wider drop-shadow-md mb-2">
            THE LAST DOOR
          </h1>
          <div className="text-[11px] text-slate-300 font-mono tracking-wide border-y border-amber-600/30 py-2">
            THE DEEPER YOU GO,
            <br />
            <span className="text-amber-400 font-bold">THE LESS YOU CAN TRUST.</span>
          </div>
        </div>

        {/* Primary Interactive Menu Choices */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onDescend}
            onMouseEnter={() => setHoveredButton('DESCEND')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full py-3 px-5 bg-amber-950/80 hover:bg-amber-900 border-2 border-amber-500 hover:border-amber-400 text-amber-200 font-bold text-xs rounded-lg transition-all shadow-lg hover:shadow-amber-900/50"
          >
            🚀 DESCEND
          </button>

          <button
            onClick={onOpenArchive}
            onMouseEnter={() => setHoveredButton('ARCHIVE')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full py-2.5 px-5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs rounded-lg transition-all"
          >
            💎 ARCHIVE
          </button>

          <button
            onClick={onOpenUpgrades}
            onMouseEnter={() => setHoveredButton('UPGRADES')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full py-2.5 px-5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs rounded-lg transition-all"
          >
            🛠️ UPGRADES
          </button>

          <button
            onClick={onOpenSettings}
            onMouseEnter={() => setHoveredButton('SETTINGS')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full py-2.5 px-5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs rounded-lg transition-all"
          >
            ⚙️ SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
