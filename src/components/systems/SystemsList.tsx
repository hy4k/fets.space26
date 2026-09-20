import React from 'react';
import { SystemDeck } from './SystemDeck';

export const SystemsList: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Title & Description */}
      <div className="bg-gradient-to-br from-white via-[#FCFBF8] to-[#FAF8F4] dark:from-[#12151D] dark:via-[#101218] dark:to-[#0B0D12] p-5 rounded-2xl border border-stone-200/90 dark:border-[#2C2417] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900 dark:text-[#FAF7F2] tracking-tight font-sans">
              System Deck & Registry
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-50 dark:bg-[#10241A] text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800/80">
              Playing-Card Metaphor
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Tactile system cards for all 36 testing booths, master proctor consoles, and caching servers. Click any card to lift and flip into full hardware, network, and application specifications.
          </p>
        </div>
      </div>

      {/* Main System Deck Component */}
      <SystemDeck />
    </div>
  );
};
