import React, { useState } from 'react';
import {
  Trophy,
  History,
  SlidersHorizontal,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Users,
} from 'lucide-react';
import { WordEntry, GameRuleConfig, PlayerInfo } from '../types';
import { formatActiveRulesSummary } from '../utils/presets';

interface DesktopSidePanelProps {
  history: WordEntry[];
  rules: GameRuleConfig;
  players: PlayerInfo[];
  activePlayerIndex: number;
  onOpenRules: (
    category?: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target',
    singleCategory?: boolean
  ) => void;
}

export const DesktopSidePanel: React.FC<DesktopSidePanelProps> = ({
  history,
  rules,
  players,
  activePlayerIndex,
  onOpenRules,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const activeRuleTags = formatActiveRulesSummary(rules);
  const connectedWordsCount = Math.max(0, history.length - 1);

  // Filter history by search query if typed
  const filteredHistory = searchQuery.trim()
    ? history.filter((h) => h.word.includes(searchQuery.trim()))
    : history;

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* 1. Player Standings / Connected Words Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-slate-800">
              プレイヤー
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {rules.targetWordCountEnabled
              ? `${connectedWordsCount} / ${rules.targetWordCount}語`
              : `${connectedWordsCount}語`}
          </span>
        </div>

        {/* Overall Target Word Count Progress Bar (if target rule is enabled) */}
        {rules.targetWordCountEnabled && (
          <div className="mb-3 p-2.5 bg-amber-50/80 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
              <span className="flex items-center gap-1 font-extrabold">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>目標語数</span>
              </span>
              <span className="font-mono font-black">
                {connectedWordsCount} / {rules.targetWordCount}語
                <span className="text-[10px] text-amber-700 font-bold ml-1">
                  ({Math.min(100, Math.round((connectedWordsCount / rules.targetWordCount) * 100))}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, (connectedWordsCount / rules.targetWordCount) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {players.map((player, idx) => {
            const isTurn = idx === activePlayerIndex % players.length;

            return (
              <div
                key={player.id}
                className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isTurn
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/70 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{player.color}</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                      {player.name}
                    </span>
                    {isTurn && (
                      <span className="shrink-0 text-[10px] font-black bg-amber-500 text-white px-2 py-0.2 rounded-full">
                        手番
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Active Rules Summary Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-slate-800">ルール</span>
          </div>
          <button
            onClick={onOpenRules}
            className="text-xs font-extrabold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-amber-200/60"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>変更</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeRuleTags.length > 0 ? (
            activeRuleTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-amber-50/80 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs"
              >
                ✓ {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 font-medium">なし</span>
          )}
        </div>
      </div>

      {/* 3. Detailed Word Chain Timeline / History List */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/90 shadow-sm flex-1 flex flex-col min-h-[300px] max-h-[460px]">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-slate-800">履歴</span>
          </div>
          <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            {history.length}語
          </span>
        </div>

        {/* Quick Search */}
        {history.length > 5 && (
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-300"
            />
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-amber-200">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              {searchQuery ? '一致なし' : '履歴なし'}
            </div>
          ) : (
            filteredHistory
              .slice()
              .reverse()
              .map((entry, reverseIdx) => {
                const actualTurn = entry.turn;
                const player = players[entry.playerIndex % players.length] || players[0];
                const isLatest = reverseIdx === 0;

                return (
                  <div
                    key={entry.id || `${entry.word}-${actualTurn}`}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isLatest
                        ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-extrabold text-slate-400 w-6">
                        #{actualTurn}
                      </span>
                      <span className="text-base">{player?.color || '🔵'}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-800 truncate">
                          {entry.word}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {player?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-500">
                        {entry.charCount}文字
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
