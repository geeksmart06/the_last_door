import React from 'react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none font-pixel animate-fade-in">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-lg max-w-xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 mb-4">
          <h2 className="text-sm md:text-base font-bold text-amber-400">
            📜 HOW TO PLAY & PROBABILITY GUIDE
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded border border-slate-600"
          >
            [X]
          </button>
        </div>

        {/* 6 Step Illustrated Rules */}
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start space-x-3">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded">1</span>
            <div>
              <p className="font-bold text-amber-300">Choose One Door</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Three doors stand before you. Exactly 1 hides 💰 Treasure, while 2 hide 👹 Monsters.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start space-x-3">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded">2</span>
            <div>
              <p className="font-bold text-amber-300">The Host Knows All</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                The mysterious Old Man knows what lies behind every door.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start space-x-3">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded">3</span>
            <div>
              <p className="font-bold text-amber-300">The Host Reveals a Monster</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                After your initial pick, the Host always opens a different door that contains a Monster. He never reveals your door or the treasure.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start space-x-3">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded">4</span>
            <div>
              <p className="font-bold text-amber-300">Stay or Switch?</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                You are offered a final choice: STAY with your original door, or SWITCH to the remaining unopened door.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-emerald-900 flex items-start space-x-3">
            <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded">5</span>
            <div>
              <p className="font-bold text-emerald-300">Switching = 2/3 Chance to Win!</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Because you had a 2/3 chance of initially picking a monster door, switching flips your odds to a <strong>66.7% win rate</strong>!
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-amber-900 flex items-start space-x-3">
            <span className="bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded">6</span>
            <div>
              <p className="font-bold text-amber-300">Staying = 1/3 Chance to Win</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Staying locks in your initial choice, which only had a <strong>33.3% chance</strong> of containing the treasure.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2 rounded shadow"
          >
            GOT IT! PLAY GAME
          </button>
        </div>
      </div>
    </div>
  );
};
