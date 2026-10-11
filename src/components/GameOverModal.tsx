import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, SlidersHorizontal, Home, Trophy, AlertTriangle, Target, Sparkles, Check } from 'lucide-react';
import { GameRuleConfig, WordEntry, PlayerInfo } from '../types';
import { PLAYER_COLORS } from '../utils/constants';
import { toHiragana } from '../utils/shiritori';

interface GameOverModalProps {
  isOpen: boolean;
  reason: {
    lastWord?: string;
    cause: 'ended_with_n' | 'timeout' | 'surrender' | 'target_reached' | 'initials_cleared';
    message: string;
  } | null;
  history: WordEntry[];
  players: PlayerInfo[];
  rules: GameRuleConfig;
  onPlayAgain: () => void;
  onChangeRules: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  reason,
  history,
  players,
  rules,
  onPlayAgain,
  onChangeRules,
  onGoHome,
}) => {
  const connectedWordsCount = Math.max(0, history.length - 1);
  const isTargetAchieved =
    rules.targetWordCountEnabled && connectedWordsCount >= rules.targetWordCount;
  const isInitialsSuccess = reason?.cause === 'initials_cleared';

  const answeredInitialsSet = React.useMemo(() => {
    return new Set(history.slice(1).map((h) => toHiragana(h.word)[0]));
  }, [history]);

  const answeredInitialsCount = rules.targetInitialsEnabled
    ? rules.targetInitials.filter((c) => answeredInitialsSet.has(c)).length
    : 0;

  useEffect(() => {
    if (
      isOpen &&
      (history.length >= 3 ||
        reason?.cause === 'target_reached' ||
        reason?.cause === 'initials_cleared')
    ) {
      try {
        confetti({
          particleCount:
            reason?.cause === 'target_reached' || reason?.cause === 'initials_cleared'
              ? 120
              : 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isOpen, history.length, reason?.cause]);

  if (!isOpen || !reason) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col my-auto animate-pop">
        {/* Top Banner */}
        <div
          className={`p-6 text-white text-center relative ${
            reason.cause === 'target_reached' || reason.cause === 'initials_cleared'
              ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500'
              : 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500'
          }`}
        >
          <div className="text-4xl sm:text-5xl mb-2">
            {reason.cause === 'target_reached' || reason.cause === 'initials_cleared'
              ? '🎉'
              : reason.cause === 'ended_with_n'
              ? '💥'
              : reason.cause === 'timeout'
              ? '⏱️'
              : '🚩'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {reason.cause === 'initials_cleared'
              ? '頭文字クリア成功！'
              : reason.cause === 'target_reached'
              ? '目標達成！'
              : '終了'}
          </h2>
          <p className="text-sm font-bold text-amber-100 mt-1">{reason.message}</p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 text-center">
          {/* Target initials result card if enabled */}
          {rules.targetInitialsEnabled && rules.targetInitials.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border text-sm font-extrabold flex flex-col gap-2 shadow-2xs ${
                isInitialsSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>目標の頭文字クリア状況</span>
                </div>
                <span className="font-black text-base">
                  {isInitialsSuccess
                    ? '🎉 完全クリア！'
                    : `${answeredInitialsCount} / ${rules.targetInitials.length} クリア`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                {rules.targetInitials.map((char) => {
                  const cleared = answeredInitialsSet.has(char);
                  return (
                    <span
                      key={char}
                      className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${
                        cleared
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      <span>「{char}」</span>
                      {cleared && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {/* Target status card if target word count rule is enabled */}
          {rules.targetWordCountEnabled && (
            <div
              className={`p-3.5 rounded-2xl border text-sm font-extrabold flex items-center justify-between shadow-2xs ${
                isTargetAchieved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600 shrink-0" />
                <span>全体目標: {rules.targetWordCount}語</span>
              </div>
              <span className="font-black text-base">
                {isTargetAchieved ? '🎯 達成！' : `${connectedWordsCount} / ${rules.targetWordCount}語`}
              </span>
            </div>
          )}

          {/* Connected Words count and last word */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50/90 p-3 sm:p-4 rounded-2xl border border-amber-300 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 block mb-0.5">つないだ言葉</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                {connectedWordsCount}
                <span className="text-sm font-bold ml-0.5">語</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                全{history.length}語
              </span>
            </div>

            <div className="bg-amber-50/80 p-3 sm:p-4 rounded-2xl border border-amber-200/70">
              <span className="text-[11px] font-bold text-slate-400 block mb-0.5">最後</span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 truncate block mt-0.5">
                {reason.lastWord ? `「${reason.lastWord}」` : 'なし'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {history.length}ターン
              </span>
            </div>
          </div>

          {/* Word Chain Preview */}
          {history.length > 0 && (
            <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-200/60 max-h-28 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 mb-1">履歴</div>
              <div className="text-xs text-slate-700 font-medium leading-relaxed">
                {history.map((h, i) => (
                  <span key={h.id || i}>
                    <span className="font-bold">{h.word}</span>
                    {i < history.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onPlayAgain}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-black text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="gameover-play-again-btn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>もう一度</span>
            </button>

            <button
              onClick={onChangeRules}
              className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              id="gameover-change-rules-btn"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-700" />
              <span>ルール変更</span>
            </button>

            <button
              onClick={onGoHome}
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              id="gameover-home-btn"
            >
              <Home className="w-3.5 h-3.5" />
              <span>トップへ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
