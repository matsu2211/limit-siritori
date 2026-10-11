import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, Info, Sparkles, Plus } from 'lucide-react';
import { GameRuleConfig } from '../types';

interface ActiveRulesBadgeProps {
  rules: GameRuleConfig;
  onOpenRules: (
    category?: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target',
    singleCategory?: boolean
  ) => void;
}

export interface RuleDetailItem {
  id: string;
  category: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target';
  group: 'length' | 'genre' | 'kana' | 'target_timer';
  groupLabel: string;
  icon: string;
  title: string;
  description: string;
  badgeColor: string;
}

export const ActiveRulesBadge: React.FC<ActiveRulesBadgeProps> = ({ rules, onOpenRules }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Collect all active rules with groups and helpful explanations
  const activeRules: RuleDetailItem[] = [];

  // --- 1. 文字数ルール ---
  if (rules.incrementalLength || rules.progressiveLengthIncrease) {
    activeRules.push({
      id: 'incremental',
      category: 'length',
      group: 'length',
      groupLabel: '文字数',
      icon: '📈',
      title: '文字数+1モード',
      description: 'ターンが進むごとに指定文字数が1文字ずつ増えていきます',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
    });
  } else if (rules.charCountMode === 'fixed') {
    activeRules.push({
      id: 'fixed-length',
      category: 'length',
      group: 'length',
      groupLabel: '文字数',
      icon: '📏',
      title: `${rules.fixedCount}文字限定`,
      description: `すべての言葉をぴったり${rules.fixedCount}文字で答える必要があります`,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    });
  } else if (rules.charCountMode === 'range') {
    const title = rules.rangeNoUpperLimit
      ? `${rules.minCount}文字以上`
      : `${rules.minCount}〜${rules.maxCount}文字`;
    const desc = rules.rangeNoUpperLimit
      ? `${rules.minCount}文字以上の言葉のみ使用可能です（上限なし）`
      : `${rules.minCount}文字以上、${rules.maxCount}文字以内の言葉のみ使用可能です`;
    activeRules.push({
      id: 'range-length',
      category: 'length',
      group: 'length',
      groupLabel: '文字数',
      icon: '📏',
      title,
      description: desc,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    });
  }

  if (rules.noSameLengthAsPrev) {
    activeRules.push({
      id: 'no-same-length',
      category: 'length',
      group: 'length',
      groupLabel: '文字数',
      icon: '🚫',
      title: '前のプレイヤーと同じ文字数禁止',
      description: '直前のプレイヤーが言った言葉と同じ文字数の言葉は使えません',
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
    });
  }

  // --- 2. ジャンル & テーマ ---
  if (rules.genreEnabled && rules.selectedGenres.length > 0) {
    activeRules.push({
      id: 'genre',
      category: 'genre',
      group: 'genre',
      groupLabel: 'テーマ・ジャンル',
      icon: '🏷️',
      title: `ジャンル: ${rules.selectedGenres.join('・')}`,
      description: `指定されたジャンル（${rules.selectedGenres.join('、')}）に属する言葉のみ有効です`,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    });
  }

  if (rules.themeEnabled && rules.themeText) {
    activeRules.push({
      id: 'theme',
      category: 'genre',
      group: 'genre',
      groupLabel: 'テーマ・ジャンル',
      icon: '🎯',
      title: `テーマ:「${rules.themeText}」`,
      description: `「${rules.themeText}」に当てはまる言葉のみ有効です`,
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100',
    });
  }

  // --- 3. 文字の縛り ---
  if (rules.noKatakana) {
    activeRules.push({
      id: 'no-katakana',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '🈲',
      title: 'カタカナ禁止',
      description: '外来語やカタカナ表記の言葉は使えません（和語・漢字表記のみ）',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    });
  }

  if (rules.onlyHiragana) {
    activeRules.push({
      id: 'only-hiragana',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: 'あ',
      title: 'ひらがなのみ',
      description: '和語やひらがなで表現される大和言葉のみ使用できます',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
    });
  }

  if (rules.kanjiExpressible) {
    activeRules.push({
      id: 'kanji-expressible',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '漢',
      title: '漢字表記できる言葉のみ',
      description: '通常漢字で表記できる言葉のみが有効です',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
    });
  }

  if (rules.noDakuonHandakuon) {
    activeRules.push({
      id: 'no-dakuon',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '❌',
      title: '濁点・半濁点禁止',
      description: '「が・ざ・だ・ば・ぱ」などの濁音・半濁点を含む言葉は使えません',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
    });
  }

  if (rules.noSmallKana) {
    activeRules.push({
      id: 'no-small-kana',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '❌',
      title: '小文字禁止',
      description: '「ゃ・ゅ・ょ・っ・ぁ」などの小さな文字を含む言葉は使えません',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
    });
  }

  if (rules.noReusedInitial) {
    activeRules.push({
      id: 'no-reused-initial',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '🔤',
      title: '使った頭文字禁止',
      description: 'このゲームですでに頭文字として使われた文字から始まる言葉は使えません',
      badgeColor: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
    });
  }

  if (rules.mustIncludePrevChar) {
    activeRules.push({
      id: 'must-include-prev',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '🔗',
      title: '前の言葉と同じ文字を含む',
      description: '直前の言葉に含まれている文字（頭文字以外）を1文字以上含む必要があります',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100',
    });
  }

  if (rules.noCommonCharExceptLink) {
    activeRules.push({
      id: 'no-common-char',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '⚡',
      title: '前の言葉と文字重複禁止',
      description: 'つながる頭文字以外で、前の言葉に含まれる文字を使ってはいけません',
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
    });
  }

  if (rules.forbiddenLetters && rules.forbiddenLetters.length > 0) {
    activeRules.push({
      id: 'forbidden-letters',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '⛔',
      title: `頭文字「${rules.forbiddenLetters.join(', ')}」禁止`,
      description: `「${rules.forbiddenLetters.join('、')}」から始まる言葉は出せません`,
      badgeColor: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
    });
  }

  if (rules.forbiddenContains && rules.forbiddenContains.length > 0) {
    activeRules.push({
      id: 'forbidden-contains',
      category: 'kana',
      group: 'kana',
      groupLabel: '文字制限',
      icon: '⛔',
      title: `「${rules.forbiddenContains.join(', ')}」を含む言葉禁止`,
      description: `言葉のどこにも「${rules.forbiddenContains.join('、')}」を含めてはいけません`,
      badgeColor: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
    });
  }

  if (rules.properNounOnly) {
    activeRules.push({
      id: 'proper-noun',
      category: 'kana',
      group: 'kana',
      groupLabel: '言葉の種類',
      icon: '🏛️',
      title: '固有名詞のみ',
      description: '人名、地名、商品名、作品名などの固有名詞のみ有効です',
      badgeColor: 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100',
    });
  }

  if (rules.tangibleOnly) {
    activeRules.push({
      id: 'tangible',
      category: 'kana',
      group: 'kana',
      groupLabel: '言葉の種類',
      icon: '📦',
      title: '実物があるもの限定',
      description: '実際に手で触れられる実体のある物のみ有効です',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    });
  }

  if (rules.noAbstract) {
    activeRules.push({
      id: 'no-abstract',
      category: 'kana',
      group: 'kana',
      groupLabel: '言葉の種類',
      icon: '💭',
      title: '抽象的な言葉禁止',
      description: '「愛」「希望」「時間」などの目に見えない概念・抽象語は禁止です',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200',
    });
  }

  // --- 4. 目標 & 時間制限 ---
  if (rules.targetWordCountEnabled && rules.targetWordCount > 0) {
    activeRules.push({
      id: 'target-word-count',
      category: 'target',
      group: 'target_timer',
      groupLabel: '目標・制限',
      icon: '🎯',
      title: `全体目標: ${rules.targetWordCount}語`,
      description: `プレイヤー全員で言葉をつないで、合計${rules.targetWordCount}語の達成を目指します`,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200',
    });
  }

  if (rules.targetInitialsEnabled && rules.targetInitials && rules.targetInitials.length > 0) {
    activeRules.push({
      id: 'target-initials',
      category: 'kana',
      group: 'target_timer',
      groupLabel: '目標・制限',
      icon: '🎯',
      title: `頭文字クリア:「${rules.targetInitials.join('・')}」`,
      description: `指定された頭文字（${rules.targetInitials.join('、')}）から始まる言葉をすべて出せばクリアです`,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    });
  }

  if (rules.timerEnabled) {
    const mins = rules.timerMinutes || (rules.timerSeconds ? Math.round(rules.timerSeconds / 60) : 3);
    activeRules.push({
      id: 'timer',
      category: 'timer',
      group: 'target_timer',
      groupLabel: '目標・制限',
      icon: '⏱️',
      title: `制限時間: ${mins}分`,
      description: `ゲーム全体の持ち時間は${mins}分です（時間切れで終了）`,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
    });
  }

  // Case 1: No special rules configured
  if (activeRules.length === 0) {
    return (
      <div className="w-full max-w-2xl lg:max-w-3xl mb-3">
        <div className="bg-white/80 backdrop-blur-xs border border-amber-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>通常ルール</span>
            <span className="text-[11px] text-slate-400 font-medium">（文字数・ジャンル等の制限なし）</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenRules('length', false)}
            className="text-xs font-black text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl border border-amber-200/90 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ルールを追加</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Special rules are configured
  return (
    <div className="w-full max-w-2xl lg:max-w-3xl mb-3.5 transition-all">
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-amber-200/90 p-3 sm:p-3.5 shadow-2xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-100 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>しばりルール</span>
            </div>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px] font-black border border-amber-300">
              {activeRules.length}個
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title={isExpanded ? '詳細を閉じる' : 'ルールの詳しい説明を見る'}
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>{isExpanded ? '説明を閉じる' : '詳細説明'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onOpenRules()}
              className="text-xs font-black text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="ルールを変更する"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>ルール変更</span>
            </button>
          </div>
        </div>

        {/* Glanceable Rule Badges Row */}
        <div className="flex flex-wrap gap-1.5 pt-2.5 items-center">
          {activeRules.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onOpenRules(r.category, true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border shadow-2xs transition-all active:scale-95 cursor-pointer text-left ${r.badgeColor}`}
              title={`【${r.groupLabel}】${r.title}（クリックで設定変更）\n${r.description}`}
            >
              <span className="text-sm leading-none">{r.icon}</span>
              <span>{r.title}</span>
            </button>
          ))}
        </div>

        {/* Detailed Explanation Drawer (when expanded) */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-amber-100 space-y-2 text-left bg-amber-50/50 rounded-xl p-3 animate-pop">
            <div className="text-[11px] font-black text-slate-500 mb-1">
              各ルールの詳細内容（クリックで編集画面を開きます）:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeRules.map((r) => (
                <div
                  key={`detail-${r.id}`}
                  onClick={() => onOpenRules(r.category, true)}
                  className="bg-white p-2.5 rounded-xl border border-amber-200/80 hover:border-amber-400 hover:shadow-2xs transition-all cursor-pointer flex items-start gap-2 group"
                >
                  <span className="text-lg shrink-0 mt-0.5">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-800 group-hover:text-amber-800 truncate">
                        {r.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold">
                        {r.groupLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
