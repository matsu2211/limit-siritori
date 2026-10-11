import React from 'react';
import {
  Play,
  Dices,
  Users,
  Sparkles,
  PlusCircle,
  Tag,
  Hash,
  Type,
  Timer,
  Check,
  X,
} from 'lucide-react';
import { GameRuleConfig, PlayerMode } from '../types';
import {
  formatActiveRulesSummary,
  getActiveRuleItems,
  removeRuleById,
} from '../utils/presets';
import { PLAYER_COLORS, DEFAULT_RULES } from '../utils/constants';

interface StartScreenProps {
  rules: GameRuleConfig;
  onUpdateRules: (rules: GameRuleConfig) => void;
  onStartGame: () => void;
  onOpenRules: (
    initialCategory?: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target',
    singleCategory?: boolean
  ) => void;
  onQuickOmakase: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  rules,
  onUpdateRules,
  onStartGame,
  onOpenRules,
  onQuickOmakase,
}) => {
  const activeRuleSummary = formatActiveRulesSummary(rules);
  const activeRuleItems = getActiveRuleItems(rules);

  // Status for the rule categories
  const isGenreActive = rules.genreEnabled || rules.themeEnabled;
  const isLengthActive =
    rules.charCountMode !== 'none' ||
    rules.noSameLengthAsPrev ||
    rules.incrementalLength;
  const isKanaActive =
    rules.noDakuonHandakuon ||
    rules.noSmallKana ||
    rules.forbiddenContains.length > 0 ||
    rules.forbiddenLetters.length > 0 ||
    rules.noReusedInitial ||
    rules.noKatakana ||
    rules.onlyHiragana;
  const isTimerActive = rules.timerEnabled;
  const isTargetActive = rules.targetWordCountEnabled;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
        <div className="relative mb-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-amber-500/20 ring-8 ring-amber-100/80 transform hover:rotate-3 transition-transform">
            し
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800">
          しばりしりとり
        </h1>
      </div>

      {/* Main Responsive Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Player settings (col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-7 border border-amber-200/90 shadow-sm space-y-5">
          {/* Player Mode Selector */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 mb-2.5">
              <Users className="w-4 h-4 text-amber-500" />
              <span>人数</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {[
                { mode: 'solo', label: '1人', icon: '👤' },
                { mode: 'duo', label: '2人', icon: '👥' },
                { mode: 'group', label: 'みんなで', icon: '🎉' },
              ].map((item) => {
                const isSelected = rules.playerMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() =>
                      onUpdateRules({
                        ...rules,
                        playerMode: item.mode as PlayerMode,
                      })
                    }
                    className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300 shadow-2xs font-extrabold text-slate-800 scale-102'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Names Input */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <span>✏️</span>
                <span>名前</span>
              </span>
              {rules.playerMode === 'group' && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-bold mr-0.5">人数:</span>
                  {[3, 4, 5, 6].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => onUpdateRules({ ...rules, groupCount: cnt })}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                        rules.groupCount === cnt
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {Array.from({
                length:
                  rules.playerMode === 'solo'
                    ? 1
                    : rules.playerMode === 'duo'
                    ? 2
                    : rules.groupCount || 3,
              }).map((_, idx) => {
                const pColor = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                const defaultName =
                  rules.playerMode === 'solo' ? 'プレイヤー' : pColor.name;
                const currentName =
                  rules.playerNames?.[idx] !== undefined
                    ? rules.playerNames[idx]
                    : defaultName;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 bg-white px-3 py-2.5 rounded-xl border border-amber-200/90 shadow-2xs focus-within:ring-2 focus-within:ring-amber-300 focus-within:border-amber-400 transition-all"
                  >
                    <span className="text-lg select-none">
                      {rules.playerMode === 'solo' ? '🟢' : pColor.color}
                    </span>
                    <input
                      type="text"
                      value={currentName}
                      onChange={(e) => {
                        const updated = [
                          ...(rules.playerNames || DEFAULT_RULES.playerNames),
                        ];
                        updated[idx] = e.target.value;
                        onUpdateRules({ ...rules, playerNames: updated });
                      }}
                      placeholder={defaultName}
                      maxLength={12}
                      className="flex-1 text-xs sm:text-sm font-bold text-slate-800 outline-hidden bg-transparent placeholder-slate-400"
                    />
                    {currentName !== defaultName && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...(rules.playerNames || DEFAULT_RULES.playerNames),
                          ];
                          updated[idx] = defaultName;
                          onUpdateRules({ ...rules, playerNames: updated });
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 rounded hover:bg-slate-100"
                        title="初期名に戻す"
                      >
                        リセット
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Rules & Start Button (col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-7 border border-amber-200/90 shadow-sm space-y-5 flex flex-col justify-between h-full">
          {/* Active Rules Card */}
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>選んだルール</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onUpdateRules({
                    ...DEFAULT_RULES,
                    // Preserve current player mode & names
                    playerMode: rules.playerMode,
                    groupCount: rules.groupCount,
                    playerNames: rules.playerNames,
                  });
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                title="すべてのしばりルールを解除します"
              >
                ルールリセット
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeRuleItems.length > 0 ? (
                activeRuleItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white text-amber-950 rounded-xl text-xs font-bold border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenRules(item.category, true)}
                      className="cursor-pointer hover:underline text-left"
                      title="クリックでこのルールの設定を開きます"
                    >
                      ✓ {item.label}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateRules(removeRuleById(rules, item.id));
                      }}
                      className="w-4 h-4 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title={`「${item.label}」を解除`}
                      aria-label={`「${item.label}」を解除`}
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-amber-800/60 font-medium">
                  なし（下のボタンやおまかせから追加できます）
                </span>
              )}
            </div>
          </div>

          {/* ルール追加 (ジャンル, 文字数, 文字指定, 時間制限) */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span>ルール追加</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* 1. ジャンル */}
              <button
                type="button"
                onClick={() => onOpenRules('genre', true)}
                className={`py-3.5 px-2 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm active:scale-98 ${
                  isGenreActive
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300 shadow-2xs font-extrabold'
                    : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                ジャンル
              </button>

              {/* 2. 文字数 */}
              <button
                type="button"
                onClick={() => onOpenRules('length', true)}
                className={`py-3.5 px-2 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm active:scale-98 ${
                  isLengthActive
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300 shadow-2xs font-extrabold'
                    : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                文字数
              </button>

              {/* 3. 文字指定 */}
              <button
                type="button"
                onClick={() => onOpenRules('kana', true)}
                className={`py-3.5 px-2 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm active:scale-98 ${
                  isKanaActive
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300 shadow-2xs font-extrabold'
                    : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                文字指定
              </button>

              {/* 4. 時間制限 */}
              <button
                type="button"
                onClick={() => onOpenRules('timer', true)}
                className={`py-3.5 px-2 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm active:scale-98 ${
                  isTimerActive
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300 shadow-2xs font-extrabold'
                    : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                時間制限
              </button>

              {/* 5. 目標語数 */}
              <button
                type="button"
                onClick={() => onOpenRules('target', true)}
                className={`py-3.5 px-2 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm active:scale-98 col-span-2 sm:col-span-1 ${
                  isTargetActive
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300 shadow-2xs font-extrabold'
                    : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                目標語数
              </button>
            </div>
          </div>

          {/* Action Row: Omakase */}
          <div>
            <button
              type="button"
              onClick={onQuickOmakase}
              className="w-full py-3 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Dices className="w-4 h-4 text-purple-600" />
              <span>おまかせ</span>
            </button>
          </div>

          {/* Big Start Button */}
          <button
            type="button"
            onClick={onStartGame}
            className="w-full py-4.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-black text-xl sm:text-2xl rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer ring-4 ring-amber-200/50"
            id="start-shiritori-btn"
          >
            <Play className="w-7 h-7 fill-white" />
            <span>スタート</span>
          </button>
        </div>
      </div>

    </div>
  );
};
