import React from 'react';
import type { SettingsConfig } from '../types/game';

interface SettingsModalProps {
  settings: SettingsConfig;
  onUpdateSettings: (newSettings: SettingsConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleProbabilityMode = () => {
    onUpdateSettings({ ...settings, probabilityMode: !settings.probabilityMode });
  };

  const toggleCrt = () => {
    onUpdateSettings({ ...settings, crtEnabled: !settings.crtEnabled });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none font-pixel animate-fade-in">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-lg max-w-md w-full p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 mb-4">
          <h2 className="text-sm md:text-base font-bold text-amber-400">⚙️ GAME SETTINGS</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded border border-slate-600"
          >
            [X]
          </button>
        </div>

        {/* Options Toggles */}
        <div className="space-y-4 text-xs">
          {/* Sound Toggle */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">🔊 8-Bit Audio & Sound</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Enable retro chiptune sound effects
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded font-bold text-xs border ${
                settings.soundEnabled
                  ? 'bg-emerald-600 text-slate-950 border-emerald-300'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Probability Mode Toggle */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-indigo-300">💡 Educational Mode</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Display math explanations after each round
              </div>
            </div>
            <button
              onClick={toggleProbabilityMode}
              className={`px-3 py-1.5 rounded font-bold text-xs border ${
                settings.probabilityMode
                  ? 'bg-indigo-600 text-white border-indigo-300'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
            >
              {settings.probabilityMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* CRT Overlay Toggle */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-amber-300">📺 CRT Monitor Overlay</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Subtle retro scanlines and vignette effect
              </div>
            </div>
            <button
              onClick={toggleCrt}
              className={`px-3 py-1.5 rounded font-bold text-xs border ${
                settings.crtEnabled
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
            >
              {settings.crtEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2 rounded shadow"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
