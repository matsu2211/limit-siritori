import React, { useEffect, useRef } from 'react';
import { ArrowRight, History } from 'lucide-react';
import { WordEntry, GameRuleConfig } from '../types';
import { PLAYER_COLORS } from '../utils/constants';

interface HistoryTrailProps {
  history: WordEntry[];
  rules: GameRuleConfig;
}

export const HistoryTrail: React.FC<HistoryTrailProps> = ({ history, rules }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest word whenever history changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="w-full bg-amber-50/50 border border-dashed border-amber-200 rounded-2xl p-4 text-center text-slate-400 text-xs font-bold">
        履歴なし
      </div>
    );
  }

  return (
    <div className="w-full bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 sm:p-4 border border-amber-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <History className="w-3.5 h-3.5 text-amber-500" />
          <span>履歴</span>
          <span className="ml-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {Math.max(0, history.length - 1)}語
          </span>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent"
        style={{ scrollBehavior: 'smooth' }}
      >
        {history.map((entry, index) => {
          const isLatest = index === history.length - 1;
          const player = PLAYER_COLORS[entry.playerIndex % PLAYER_COLORS.length];

          return (
            <React.Fragment key={entry.id || `${entry.word}-${index}`}>
              <div
                className={`shrink-0 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isLatest
                    ? 'bg-amber-100/90 border-amber-400 shadow-sm scale-105 ring-2 ring-amber-300/60'
                    : 'bg-white border-amber-200/70 hover:border-amber-300'
                }`}
              >
                {rules.playerMode !== 'solo' && (
                  <div className="flex items-center gap-1 mb-1 max-w-[90px]" title={rules.playerNames?.[entry.playerIndex] || player.name}>
                    <span className="text-[11px]">{player.color}</span>
                    <span className="text-[10px] font-bold text-slate-500 truncate">
                      {rules.playerNames?.[entry.playerIndex] || player.name}
                    </span>
                  </div>
                )}

                <div className="text-base sm:text-lg font-extrabold text-slate-800 tracking-wide">
                  {entry.word}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                    {entry.charCount}文字
                  </span>
                </div>
              </div>

              {index < history.length - 1 && (
                <ArrowRight className="w-4 h-4 text-amber-400/80 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
