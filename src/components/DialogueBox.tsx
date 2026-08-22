import React, { useState, useEffect } from 'react';

export interface ActionOption {
  label: string; // e.g. "[A] Continue"
  key: string; // e.g. "a" or "1"
  onClick: () => void;
  variant?: 'gold' | 'cyan' | 'red' | 'emerald';
}

interface DialogueBoxProps {
  text: string;
  speaker?: string;
  options?: ActionOption[];
  probabilityTip?: string | null;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  text,
  speaker = 'THE HOST',
  options = [],
  probabilityTip,
}) => {
  const safeText = text || 'The Host watches silently as the anomaly shifts...';
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect logic with substring slicing (solves text garbling completely)
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const timer = setInterval(() => {
      index++;
      if (index <= safeText.length) {
        setDisplayedText(safeText.substring(0, index));
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [safeText]);

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(safeText);
      setIsTyping(false);
    }
  };

  return (
    <div
      onClick={handleSkipTyping}
      className="relative bg-slate-950/95 border-4 border-amber-500 rounded-lg p-4 shadow-2xl font-pixel select-none cursor-pointer my-2"
    >
      {/* Gold Corner Ornaments */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 border border-slate-950" />
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 border border-slate-950" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 border border-slate-950" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 border border-slate-950" />

      {/* Speaker Tag */}
      <div className="text-amber-400 text-xs font-bold tracking-wider mb-2 flex items-center justify-between border-b border-amber-900/60 pb-1">
        <span>◆ {speaker}</span>
        {isTyping && <span className="text-amber-500/70 text-[10px] animate-pulse">TYPING...</span>}
      </div>

      {/* Dialogue Text (100% Clean Substring) */}
      <div className="text-white text-sm md:text-base leading-relaxed min-h-[50px] font-mono">
        {displayedText}
        {isTyping && <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-ping" />}
      </div>

      {/* Educational Probability Mode Explanation Tip */}
      {probabilityTip && !isTyping && (
        <div className="mt-3 p-2 bg-indigo-950/80 border border-indigo-500/60 rounded text-xs text-indigo-200 animate-fade-in">
          <span className="text-amber-400 font-bold">💡 PROBABILITY MODE: </span>
          {probabilityTip}
        </div>
      )}

      {/* Action Choice Buttons */}
      {options.length > 0 && !isTyping && (
        <div className="mt-4 pt-3 border-t border-amber-900/40 flex flex-wrap items-center justify-center gap-3">
          {options.map((opt, idx) => {
            let variantClasses =
              'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300';
            if (opt.variant === 'cyan') {
              variantClasses = 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-300';
            } else if (opt.variant === 'red') {
              variantClasses = 'bg-red-600 hover:bg-red-500 text-white border-red-300';
            } else if (opt.variant === 'emerald') {
              variantClasses =
                'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-300';
            }

            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  opt.onClick();
                }}
                className={`font-pixel font-bold text-xs px-4 py-2 rounded-md border-2 shadow-lg transition-transform active:scale-95 ${variantClasses}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
