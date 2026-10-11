import React from 'react';
import { SlidersHorizontal, Volume2, VolumeX, RotateCcw, Home } from 'lucide-react';
import { GameRuleConfig } from '../types';
import { formatActiveRulesSummary } from '../utils/presets';

interface HeaderProps {
  rules: GameRuleConfig;
  onOpenRules: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  inGame: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  rules,
  onOpenRules,
  onRestart,
  onGoHome,
  isMuted,
  onToggleMute,
  inGame,
}) => {
  const activeRuleTags = formatActiveRulesSummary(rules);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-amber-200/70 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Left: App Title */}
        <div className="flex items-center gap-2">
          {inGame && (
            <button
              onClick={onGoHome}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-amber-100/60 rounded-xl transition-colors cursor-pointer"
              title="トップに戻る"
              aria-label="トップに戻る"
            >
              <Home className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2" onClick={onGoHome} role="button" tabIndex={0}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-base shadow-sm">
              し
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-tight">
                しばりしりとり
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Rules summary pill for desktop/tablet */}
        {inGame && (
          <button
            onClick={onOpenRules}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-full text-xs font-medium transition-all shadow-2xs max-w-xs truncate cursor-pointer group"
            title="現在のルール設定（クリックで変更）"
          >
            <span className="truncate">
              {activeRuleTags.length > 0 ? activeRuleTags.join(' ｜ ') : '通常'}
            </span>
            <span className="text-amber-500 group-hover:translate-x-0.5 transition-transform text-[10px]">
              ✏️
            </span>
          </button>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {inGame && (
            <button
              onClick={onRestart}
              className="p-2 text-slate-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium"
              title="やり直す"
              aria-label="最初からやり直す"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">やり直す</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-amber-100/60 rounded-xl transition-colors cursor-pointer"
            title={isMuted ? '音声をオン' : '音声をミュート'}
            aria-label={isMuted ? '音声をオン' : '音声をミュート'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            id="open-rules-btn"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>ルール</span>
          </button>
        </div>
      </div>

      {/* Mobile Rules Banner */}
      {inGame && (
        <div
          onClick={onOpenRules}
          className="sm:hidden w-full bg-amber-100/60 border-t border-amber-200/60 px-4 py-1 flex items-center justify-between text-xs text-amber-900 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-amber-700">ルール:</span>
            <span className="truncate">{activeRuleTags.join(' ｜ ')}</span>
          </div>
          <span className="text-[10px] text-amber-700 underline shrink-0 ml-1">設定</span>
        </div>
      )}
    </header>
  );
};
