import React, { useState } from 'react';
import {
  X,
  Dices,
  RotateCcw,
  Check,
  Sparkles,
  Users,
  Timer,
  Hash,
  Tag,
  Ban,
  Type,
  TrendingUp,
  Award,
  BookOpen,
  Target,
} from 'lucide-react';
import { GameRuleConfig, PlayerMode } from '../types';
import {
  GENRE_OPTIONS,
  TIMER_PRESETS,
  TARGET_WORD_PRESETS,
  HIRAGANA_CANDIDATES_FOR_INITIALS,
  DEFAULT_RULES,
  PLAYER_COLORS,
} from '../utils/constants';
import { generateOmakaseRules, PRESET_BUNDLES } from '../utils/presets';
import { toHiragana } from '../utils/shiritori';

interface RuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: GameRuleConfig;
  onSaveRules: (newRules: GameRuleConfig) => void;
  initialCategory?: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target';
  singleCategoryMode?: boolean;
}

export const RuleSettingsModal: React.FC<RuleSettingsModalProps> = ({
  isOpen,
  onClose,
  rules: initialRules,
  onSaveRules,
  initialCategory,
  singleCategoryMode = false,
}) => {
  const [currentRules, setCurrentRules] = useState<GameRuleConfig>({ ...initialRules });
  const [omakaseBanner, setOmakaseBanner] = useState<string[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target'
  >(initialCategory || 'players');
  const [randomDrawCount, setRandomDrawCount] = useState<number>(5);
  const [lotteryNotice, setLotteryNotice] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentRules({ ...initialRules });
      if (initialCategory) {
        setActiveCategory(initialCategory);
      }
    }
  }, [isOpen, initialCategory, initialRules]);

  if (!isOpen) return null;

  // Handler for 🎲 おまかせルール (Specification #15)
  const handleOmakase = () => {
    const { rules: randomRules, summaryList } = generateOmakaseRules();
    // Preserve current playerMode & playerNames
    randomRules.playerMode = currentRules.playerMode;
    randomRules.groupCount = currentRules.groupCount;
    randomRules.playerNames = currentRules.playerNames;
    setCurrentRules(randomRules);
    setOmakaseBanner(summaryList);
  };

  const handleResetAll = () => {
    setCurrentRules({
      ...DEFAULT_RULES,
      playerMode: currentRules.playerMode,
      groupCount: currentRules.groupCount,
      playerNames: currentRules.playerNames,
    });
    setOmakaseBanner(null);
  };

  const handleUpdatePlayerName = (index: number, newName: string) => {
    setCurrentRules((prev) => {
      const names = [...(prev.playerNames || DEFAULT_RULES.playerNames)];
      names[index] = newName;
      return {
        ...prev,
        playerNames: names,
      };
    });
  };

  const handleApply = () => {
    onSaveRules(currentRules);
    onClose();
  };

  // Forbidden starting letter tag helper
  const addForbiddenLetter = (letter: string) => {
    const trimmed = letter.trim();
    if (!trimmed) return;
    if (!currentRules.forbiddenLetters.includes(trimmed)) {
      setCurrentRules((prev) => ({
        ...prev,
        forbiddenLetters: [...prev.forbiddenLetters, trimmed],
      }));
    }
  };

  const removeForbiddenLetter = (letter: string) => {
    setCurrentRules((prev) => ({
      ...prev,
      forbiddenLetters: prev.forbiddenLetters.filter((l) => l !== letter),
    }));
  };

  // Forbidden contains tag helper
  const addForbiddenContains = (char: string) => {
    const trimmed = char.trim();
    if (!trimmed) return;
    if (!currentRules.forbiddenContains.includes(trimmed)) {
      setCurrentRules((prev) => ({
        ...prev,
        forbiddenContains: [...prev.forbiddenContains, trimmed],
      }));
    }
  };

  const removeForbiddenContains = (char: string) => {
    setCurrentRules((prev) => ({
      ...prev,
      forbiddenContains: prev.forbiddenContains.filter((c) => c !== char),
    }));
  };

  const addTargetInitial = (letter: string) => {
    const trimmed = letter.trim();
    if (!trimmed) return;
    const h = toHiragana(trimmed)[0];
    if (!h) return;
    if (!currentRules.targetInitials.includes(h)) {
      setCurrentRules((prev) => ({
        ...prev,
        targetInitials: [...prev.targetInitials, h],
      }));
    }
  };

  const removeTargetInitial = (char: string) => {
    setCurrentRules((prev) => ({
      ...prev,
      targetInitials: prev.targetInitials.filter((c) => c !== char),
    }));
  };

  const handleRandomLotteryInitials = (count: number) => {
    setIsDrawing(true);
    const safeCount = Math.max(1, Math.min(count, HIRAGANA_CANDIDATES_FOR_INITIALS.length));
    const shuffled = [...HIRAGANA_CANDIDATES_FOR_INITIALS].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, safeCount);
    // Sort in standard 50-on order for clean readability
    picked.sort(
      (a, b) =>
        HIRAGANA_CANDIDATES_FOR_INITIALS.indexOf(a) -
        HIRAGANA_CANDIDATES_FOR_INITIALS.indexOf(b)
    );

    setCurrentRules((prev) => ({
      ...prev,
      targetInitials: picked,
    }));

    setLotteryNotice(`🎲 「${picked.join('」「')}」の${picked.length}文字を抽選しました！`);
    setTimeout(() => {
      setIsDrawing(false);
    }, 250);
    setTimeout(() => {
      setLotteryNotice(null);
    }, 4000);
  };

  const clearTargetInitials = () => {
    setCurrentRules((prev) => ({
      ...prev,
      targetInitials: [],
    }));
    setLotteryNotice('クリア対象の頭文字をすべて消去しました');
    setTimeout(() => setLotteryNotice(null), 2500);
  };

  const toggleGenre = (genreLabel: string) => {
    setCurrentRules((prev) => {
      const exists = prev.selectedGenres.includes(genreLabel);
      return {
        ...prev,
        genreEnabled: true,
        selectedGenres: exists
          ? prev.selectedGenres.filter((g) => g !== genreLabel)
          : [...prev.selectedGenres, genreLabel],
      };
    });
  };

  const categoryDetails: Record<
    'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target',
    { label: string; icon: any; emoji: string }
  > = {
    players: { label: '人数', icon: Users, emoji: '👥' },
    length: { label: '文字数', icon: Hash, emoji: '🔢' },
    genre: { label: 'ジャンル', icon: Tag, emoji: '🏷️' },
    kana: { label: '文字指定', icon: Type, emoji: '🔤' },
    timer: { label: '時間制限', icon: Timer, emoji: '⏱️' },
    target: { label: '目標語数', icon: Target, emoji: '🎯' },
  };

  const handleResetCurrentCategory = () => {
    if (activeCategory === 'genre') {
      setCurrentRules((prev) => ({
        ...prev,
        genreEnabled: false,
        selectedGenres: [],
        themeEnabled: false,
        themeText: '',
      }));
    } else if (activeCategory === 'length') {
      setCurrentRules((prev) => ({
        ...prev,
        charCountMode: 'none',
        exactCharCount: 4,
        minCount: 3,
        maxCount: 5,
        rangeNoUpperLimit: false,
        incrementalLength: false,
        incrementalStartCount: 3,
        noSameLengthAsPrev: false,
        progressiveLengthIncrease: false,
      }));
    } else if (activeCategory === 'kana') {
      setCurrentRules((prev) => ({
        ...prev,
        noReusedInitial: false,
        noReusedCharOverall: false,
        noDakuonHandakuon: false,
        noSmallKana: false,
        forbiddenLetters: [],
        forbiddenContains: [],
        mustIncludePrevChar: false,
        noCommonCharExceptLink: false,
        noKatakana: false,
        onlyHiragana: false,
        kanjiExpressible: false,
        properNounOnly: false,
        tangibleOnly: false,
        noAbstract: false,
        targetInitialsEnabled: false,
        targetInitials: [],
      }));
    } else if (activeCategory === 'timer') {
      setCurrentRules((prev) => ({
        ...prev,
        timerEnabled: false,
        timerMinutes: 3,
        timerSeconds: 180,
      }));
    } else if (activeCategory === 'target') {
      setCurrentRules((prev) => ({
        ...prev,
        targetWordCountEnabled: false,
        targetWordCount: 20,
      }));
    } else if (activeCategory === 'players') {
      setCurrentRules((prev) => ({
        ...prev,
        playerMode: 'solo',
        groupCount: 3,
        playerNames: ['プレイヤー'],
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className={`bg-white w-full ${
          singleCategoryMode ? 'max-w-xl sm:max-w-2xl' : 'max-w-3xl lg:max-w-4xl'
        } rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh] my-auto`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {singleCategoryMode
                ? categoryDetails[activeCategory]?.emoji || '⚙️'
                : '⚙️'}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {singleCategoryMode
                  ? categoryDetails[activeCategory]?.label
                  : 'ルール設定'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {singleCategoryMode && (
              <button
                type="button"
                onClick={handleResetCurrentCategory}
                className="text-xs text-amber-100 hover:text-white hover:bg-white/20 px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer"
              >
                リセット
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🎲 おまかせ & Presets Quick Bar (Only in full rules mode) */}
        {!singleCategoryMode && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={handleOmakase}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span>おまかせ</span>
              </button>

              <button
                onClick={handleResetAll}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-amber-100/70 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>リセット</span>
              </button>
            </div>

            {/* Omakase Banner Preview */}
            {omakaseBanner && (
              <div className="p-3 bg-purple-100/80 border-2 border-purple-300 rounded-2xl animate-pop">
                <div className="text-xs font-bold text-purple-900 flex items-center gap-1 mb-1">
                  <span>おまかせ内容</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {omakaseBanner.map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 bg-white text-purple-800 text-xs font-black rounded-lg border border-purple-200 shadow-2xs"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Navigation Tabs (Only in full rules mode) */}
        {!singleCategoryMode && (
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50 text-xs font-bold text-slate-600">
            {[
              { id: 'players', label: '人数', icon: Users },
              { id: 'length', label: '文字数', icon: Hash },
              { id: 'genre', label: 'ジャンル', icon: Tag },
              { id: 'kana', label: '文字指定', icon: Type },
              { id: 'timer', label: '時間制限', icon: Timer },
              { id: 'target', label: '目標語数', icon: Target },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex-1 min-w-[75px] py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-500 text-amber-800 bg-white shadow-2xs font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: プレイヤー設定 */}
          {activeCategory === 'players' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mb-2.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>人数</span>
                </h3>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { mode: 'solo', label: '1人', icon: '👤' },
                    { mode: 'duo', label: '2人', icon: '👥' },
                    { mode: 'group', label: 'みんなで', icon: '🎉' },
                  ].map((item) => {
                    const isSelected = currentRules.playerMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() =>
                          setCurrentRules((prev) => ({
                            ...prev,
                            playerMode: item.mode as PlayerMode,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {currentRules.playerMode === 'group' && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">人数:</span>
                    <div className="flex items-center gap-2">
                      {[3, 4, 5, 6].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() =>
                            setCurrentRules((prev) => ({ ...prev, groupCount: cnt }))
                          }
                          className={`w-9 h-9 rounded-xl font-black text-sm transition-all cursor-pointer ${
                            currentRules.groupCount === cnt
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-100'
                          }`}
                        >
                          {cnt}人
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* プレイヤー名の編集 */}
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-extrabold text-slate-800">
                      名前
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentRules((prev) => ({
                          ...prev,
                          playerNames: [...DEFAULT_RULES.playerNames],
                        }))
                      }
                      className="text-[11px] text-amber-700 hover:text-amber-900 underline cursor-pointer font-bold"
                    >
                      リセット
                    </button>
                  </div>

                  <div className="space-y-2">
                    {Array.from({
                      length:
                        currentRules.playerMode === 'solo'
                          ? 1
                          : currentRules.playerMode === 'duo'
                          ? 2
                          : currentRules.groupCount || 3,
                    }).map((_, idx) => {
                      const pColor = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                      const defaultName =
                        currentRules.playerMode === 'solo' ? 'プレイヤー' : pColor.name;
                      const currentName =
                        currentRules.playerNames?.[idx] !== undefined
                          ? currentRules.playerNames[idx]
                          : defaultName;

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-base w-7 text-center select-none">
                            {currentRules.playerMode === 'solo' ? '🟢' : pColor.color}
                          </span>
                          <input
                            type="text"
                            value={currentName}
                            onChange={(e) => handleUpdatePlayerName(idx, e.target.value)}
                            placeholder={defaultName}
                            maxLength={12}
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-hidden transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preset Bundles Quick Pick */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">プリセット</div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_BUNDLES.slice(1).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setCurrentRules((prev) => ({
                          ...prev,
                          ...preset.config,
                        }))
                      }
                      className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                        <span>{preset.emoji}</span>
                        <span>{preset.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 文字数 */}
          {activeCategory === 'length' && (
            <div className="space-y-5">
              {/* 文字数指定 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-slate-800">文字数</div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentRules((prev) => ({
                          ...prev,
                          charCountMode: prev.charCountMode === 'none' ? 'fixed' : 'none',
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        currentRules.charCountMode !== 'none'
                          ? 'bg-amber-500 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {currentRules.charCountMode !== 'none' ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {currentRules.charCountMode !== 'none' && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-3 animate-pop">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentRules((prev) => ({ ...prev, charCountMode: 'fixed' }))
                        }
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentRules.charCountMode === 'fixed'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        限定
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentRules((prev) => ({ ...prev, charCountMode: 'range' }))
                        }
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentRules.charCountMode === 'range'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        ◯文字〜◯文字
                      </button>
                    </div>

                    {currentRules.charCountMode === 'fixed' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setCurrentRules((prev) => ({ ...prev, fixedCount: num }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              currentRules.fixedCount === num
                                ? 'bg-amber-500 text-white shadow-xs scale-105'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {num}文字
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-600">
                              {currentRules.rangeNoUpperLimit ? '文字数:' : '最小:'}
                            </span>
                            <select
                              value={currentRules.minCount}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCurrentRules((prev) => ({
                                  ...prev,
                                  minCount: val,
                                  maxCount: Math.max(prev.maxCount, val),
                                }));
                              }}
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold"
                            >
                              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n}文字
                                </option>
                              ))}
                            </select>
                          </div>

                          {!currentRules.rangeNoUpperLimit ? (
                            <>
                              <span className="text-slate-400 font-bold">〜</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-600">最大:</span>
                                <select
                                  value={currentRules.maxCount}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'unlimited') {
                                      setCurrentRules((prev) => ({
                                        ...prev,
                                        rangeNoUpperLimit: true,
                                      }));
                                    } else {
                                      setCurrentRules((prev) => ({
                                        ...prev,
                                        rangeNoUpperLimit: false,
                                        maxCount: Math.max(Number(val), currentRules.minCount),
                                      }));
                                    }
                                  }}
                                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold"
                                >
                                  {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => (
                                    <option key={n} value={n}>
                                      {n}文字
                                    </option>
                                  ))}
                                  <option value="unlimited">上限なし (◯文字以上)</option>
                                </select>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              以上（上限なし）
                            </span>
                          )}
                        </div>

                        {/* ◯文字以上 設定トグル・クイック選択 */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!currentRules.rangeNoUpperLimit}
                              onChange={(e) =>
                                setCurrentRules((prev) => ({
                                  ...prev,
                                  rangeNoUpperLimit: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-400 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-700">
                              「◯文字以上」に設定する
                            </span>
                          </label>

                          {currentRules.rangeNoUpperLimit && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[11px] text-slate-400 font-bold">よく使う設定:</span>
                              {[5, 6, 7, 8].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() =>
                                    setCurrentRules((prev) => ({ ...prev, minCount: n }))
                                  }
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                    currentRules.minCount === n
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {n}文字以上
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 前のプレイヤーと同じ文字数禁止 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-slate-800">
                    前のプレイヤーと同じ文字数禁止
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentRules((prev) => ({
                      ...prev,
                      noSameLengthAsPrev: !prev.noSameLengthAsPrev,
                    }))
                  }
                  className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                    currentRules.noSameLengthAsPrev ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                      currentRules.noSameLengthAsPrev ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* ターンごとに+1文字 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">
                      ターンごとに+1文字
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        incrementalLength: !prev.incrementalLength,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                      currentRules.incrementalLength ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                        currentRules.incrementalLength ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {currentRules.incrementalLength && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">開始:</span>
                    {[2, 3, 4].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() =>
                          setCurrentRules((prev) => ({ ...prev, incrementalStartCount: cnt }))
                        }
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentRules.incrementalStartCount === cnt
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {cnt}文字
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ジャンル */}
          {activeCategory === 'genre' && (
            <div className="space-y-5">
              {/* ジャンル */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">
                      ジャンル
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        genreEnabled: !prev.genreEnabled,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                      currentRules.genreEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                        currentRules.genreEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {currentRules.genreEnabled && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {GENRE_OPTIONS.map((g) => {
                        const isSelected = currentRules.selectedGenres.includes(g.label);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggleGenre(g.label)}
                            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-white shadow-2xs scale-102'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{g.icon}</span>
                            <span className="truncate">{g.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 自由テーマ */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">
                      自由テーマ
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        themeEnabled: !prev.themeEnabled,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                      currentRules.themeEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                        currentRules.themeEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {currentRules.themeEnabled && (
                  <div className="pt-2 border-t border-slate-200/80 flex gap-2">
                    <input
                      type="text"
                      value={currentRules.themeText}
                      onChange={(e) =>
                        setCurrentRules((prev) => ({ ...prev, themeText: e.target.value }))
                      }
                      placeholder="テーマを入力"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-300 outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: C, E, F, G 文字・言葉縛り (Sections 7, 9, 10, 11) */}
          {activeCategory === 'kana' && (
            <div className="space-y-4">
              {/* 10. 文字に関する縛り */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="text-sm font-extrabold text-slate-800">
                  文字の縛り
                </div>

                {/* 濁点・半濁点禁止 */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-700">濁点・半濁点禁止</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentRules.noDakuonHandakuon}
                    onChange={(e) =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        noDakuonHandakuon: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-amber-500 rounded-md cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 小文字禁止 */}
                <div className="flex items-center justify-between py-1 border-t border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-700">小文字禁止</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentRules.noSmallKana}
                    onChange={(e) =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        noSmallKana: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-amber-500 rounded-md cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 特定の文字を含む言葉禁止 */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    特定の文字を含むのを禁止
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="禁止文字"
                      maxLength={2}
                      id="forbidden-contain-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          addForbiddenContains(val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          'forbidden-contain-input'
                        ) as HTMLInputElement;
                        if (input) {
                          addForbiddenContains(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800"
                    >
                      追加
                    </button>
                  </div>
                  {currentRules.forbiddenContains.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentRules.forbiddenContains.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-lg"
                        >
                          「{c}」禁止
                          <button
                            type="button"
                            onClick={() => removeForbiddenContains(c)}
                            className="text-red-500 hover:text-red-700 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 頭文字 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="text-sm font-extrabold text-slate-800">頭文字</div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-700">頭文字の重複禁止</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentRules.noReusedInitial}
                    onChange={(e) =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        noReusedInitial: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-amber-500 rounded-md cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    特定の頭文字を禁止
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="禁止頭文字"
                      maxLength={2}
                      id="forbidden-letter-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          addForbiddenLetter(val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          'forbidden-letter-input'
                        ) as HTMLInputElement;
                        if (input) {
                          addForbiddenLetter(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800"
                    >
                      追加
                    </button>
                  </div>
                  {currentRules.forbiddenLetters.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentRules.forbiddenLetters.map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-lg"
                        >
                          「{l}」始まり禁止
                          <button
                            type="button"
                            onClick={() => removeForbiddenLetter(l)}
                            className="text-red-500 hover:text-red-700 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 特定の頭文字をクリアする */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span>特定の頭文字をクリアする</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        指定時間内に設定した頭文字から始まる言葉をすべて出すと成功！
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newEnabled = !currentRules.targetInitialsEnabled;
                        setCurrentRules((prev) => ({
                          ...prev,
                          targetInitialsEnabled: newEnabled,
                          targetInitials:
                            newEnabled && prev.targetInitials.length === 0
                              ? [...HIRAGANA_CANDIDATES_FOR_INITIALS]
                                  .sort(() => Math.random() - 0.5)
                                  .slice(0, 5)
                                  .sort(
                                    (a, b) =>
                                      HIRAGANA_CANDIDATES_FOR_INITIALS.indexOf(a) -
                                      HIRAGANA_CANDIDATES_FOR_INITIALS.indexOf(b)
                                  )
                              : prev.targetInitials,
                          // タイマーが未設定ならデフォルトで3分を有効化
                          timerEnabled: newEnabled && !prev.timerEnabled ? true : prev.timerEnabled,
                          timerMinutes: prev.timerMinutes || 3,
                          timerSeconds: (prev.timerMinutes || 3) * 60,
                        }));
                      }}
                      className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                        currentRules.targetInitialsEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                          currentRules.targetInitialsEnabled ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {currentRules.targetInitialsEnabled && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-3">
                      {/* 任意の文字数をランダム抽選 */}
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                            <Dices className="w-4 h-4 text-emerald-600" />
                            <span>頭文字をランダム抽選</span>
                          </div>
                          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                            設定数: {randomDrawCount}文字
                          </span>
                        </div>

                        {/* 文字数の指定 & クイック選択 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setRandomDrawCount((prev) => Math.max(1, prev - 1))}
                              className="w-6 h-6 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center cursor-pointer transition-colors"
                              title="1文字減らす"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={randomDrawCount}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val)) {
                                  setRandomDrawCount(Math.max(1, Math.min(20, val)));
                                }
                              }}
                              className="w-10 text-center text-xs font-black text-emerald-950 outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => setRandomDrawCount((prev) => Math.min(20, prev + 1))}
                              className="w-6 h-6 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center cursor-pointer transition-colors"
                              title="1文字増やす"
                            >
                              +
                            </button>
                            <span className="text-[11px] font-bold text-slate-500 pr-1">文字</span>
                          </div>

                          {/* クイック選択ボタン */}
                          <div className="flex items-center gap-1">
                            {[3, 5, 7, 10].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setRandomDrawCount(num)}
                                className={`px-2 py-1 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${
                                  randomDrawCount === num
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                }`}
                              >
                                {num}文字
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 抽選ボタン & 全消去 */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRandomLotteryInitials(randomDrawCount)}
                            className={`flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                              isDrawing ? 'animate-pulse' : ''
                            }`}
                          >
                            <Dices className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
                            <span>{randomDrawCount}文字をランダム抽選する</span>
                          </button>

                          {currentRules.targetInitials.length > 0 && (
                            <button
                              type="button"
                              onClick={clearTargetInitials}
                              className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
                              title="選択した頭文字をすべて消去"
                            >
                              全消去
                            </button>
                          )}
                        </div>

                        {/* 抽選結果メッセージ */}
                        {lotteryNotice && (
                          <div className="p-2 bg-emerald-100/90 border border-emerald-300 rounded-lg text-emerald-950 text-xs font-bold animate-pop flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{lotteryNotice}</span>
                          </div>
                        )}
                      </div>

                      {/* 任意の一文字追加 */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          頭文字を個別に追加
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="例: あ"
                            maxLength={1}
                            id="target-initial-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value;
                                addTargetInitial(val);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                            className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-center"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                'target-initial-input'
                              ) as HTMLInputElement;
                              if (input) {
                                addTargetInitial(input.value);
                                input.value = '';
                              }
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-2xs"
                          >
                            追加
                          </button>
                        </div>
                      </div>

                      {/* 選択中の頭文字一覧 */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          クリア対象の頭文字 ({currentRules.targetInitials.length}文字):
                        </div>
                        {currentRules.targetInitials.length === 0 ? (
                          <div className="text-xs text-amber-700 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                            ※ 1文字以上追加してください
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {currentRules.targetInitials.map((char) => (
                              <span
                                key={char}
                                className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs"
                              >
                                「{char}」
                                <button
                                  type="button"
                                  onClick={() => removeTargetInitial(char)}
                                  className="text-emerald-700 hover:text-emerald-950 font-black cursor-pointer text-sm"
                                  title="削除"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 制限時間の案内 */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-bold">
                          <Timer className="w-3.5 h-3.5 text-amber-600" />
                          <span>制限時間:</span>
                        </span>
                        <span className="font-black text-amber-700">
                          {currentRules.timerEnabled
                            ? `${currentRules.timerMinutes || 3}分 (時間制限タブで変更可能)`
                            : '無制限 (時間制限タブで設定推奨)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 直前の文字 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="text-sm font-extrabold text-slate-800">直前の文字</div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-700">
                      直前の文字を1つ含む
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentRules.mustIncludePrevChar}
                    onChange={(e) =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        mustIncludePrevChar: e.target.checked,
                        noCommonCharExceptLink: e.target.checked
                          ? false
                          : prev.noCommonCharExceptLink,
                      }))
                    }
                    className="w-5 h-5 text-amber-500 rounded-md cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-700">
                      直前の文字の重複禁止
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentRules.noCommonCharExceptLink}
                    onChange={(e) =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        noCommonCharExceptLink: e.target.checked,
                        mustIncludePrevChar: e.target.checked
                          ? false
                          : prev.mustIncludePrevChar,
                      }))
                    }
                    className="w-5 h-5 text-amber-500 rounded-md cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* 言葉の種類 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-sm font-extrabold text-slate-800">
                  言葉の種類
                </div>
                {[
                  { key: 'noKatakana', label: 'カタカナ禁止' },
                  { key: 'onlyHiragana', label: 'ひらがなのみ' },
                  { key: 'kanjiExpressible', label: '漢字表記のみ' },
                  { key: 'properNounOnly', label: '固有名詞のみ' },
                  { key: 'tangibleOnly', label: '実物のみ' },
                  { key: 'noAbstract', label: '抽象語禁止' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1 border-t border-slate-200/60 first:border-0">
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(currentRules as any)[item.key]}
                      onChange={(e) =>
                        setCurrentRules((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-amber-500 rounded cursor-pointer accent-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: 時間制限 */}
          {activeCategory === 'timer' && (
            <div className="space-y-5">
              {/* 全体のゲーム時間制限 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">時間制限</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      ゲームプレイ全体の制限時間を設定します
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentRules((prev) => {
                        const newEnabled = !prev.timerEnabled;
                        const mins = prev.timerMinutes || 3;
                        return {
                          ...prev,
                          timerEnabled: newEnabled,
                          timerMinutes: mins,
                          timerSeconds: mins * 60,
                        };
                      })
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                      currentRules.timerEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                        currentRules.timerEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {currentRules.timerEnabled && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-4">
                    {/* 分数プリセットボタン */}
                    <div>
                      <div className="text-xs font-bold text-slate-600 mb-2">よく使う分数から選ぶ</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {TIMER_PRESETS.map((min) => (
                          <button
                            key={min}
                            type="button"
                            onClick={() =>
                              setCurrentRules((prev) => ({
                                ...prev,
                                timerMinutes: min,
                                timerSeconds: min * 60,
                              }))
                            }
                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              (currentRules.timerMinutes || 3) === min
                                ? 'bg-amber-500 text-white shadow-xs scale-105'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {min}分
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 任意の分数入力 (カスタム分数) */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>任意の分数で設定</span>
                        <span className="text-xs font-black text-amber-600">
                          現在: {currentRules.timerMinutes || 3}分 ({ (currentRules.timerMinutes || 3) * 60 }秒)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentRules.timerMinutes || 3;
                            if (cur > 1) {
                              setCurrentRules((prev) => ({
                                ...prev,
                                timerMinutes: cur - 1,
                                timerSeconds: (cur - 1) * 60,
                              }));
                            }
                          }}
                          disabled={(currentRules.timerMinutes || 3) <= 1}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-lg text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={currentRules.timerMinutes || 3}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) {
                                const clamped = Math.min(60, val);
                                setCurrentRules((prev) => ({
                                  ...prev,
                                  timerMinutes: clamped,
                                  timerSeconds: clamped * 60,
                                }));
                              }
                            }}
                            className="w-20 text-center text-xl font-black py-1.5 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-hidden bg-amber-50/50 text-slate-800"
                          />
                          <span className="text-sm font-bold text-slate-600">分</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentRules.timerMinutes || 3;
                            if (cur < 60) {
                              setCurrentRules((prev) => ({
                                ...prev,
                                timerMinutes: cur + 1,
                                timerSeconds: (cur + 1) * 60,
                              }));
                            }
                          }}
                          disabled={(currentRules.timerMinutes || 3) >= 60}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-lg text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 text-center">
                        ※ 1分〜60分の間で自由に設定できます
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: 目標語数 */}
          {activeCategory === 'target' && (
            <div className="space-y-5">
              {/* 全体の目標語数設定 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">全体での目標語数</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      ゲーム全体でつないで達成を目指す目標語数を設定します
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentRules((prev) => ({
                        ...prev,
                        targetWordCountEnabled: !prev.targetWordCountEnabled,
                        targetWordCount: prev.targetWordCount || 20,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                      currentRules.targetWordCountEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                        currentRules.targetWordCountEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {currentRules.targetWordCountEnabled && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-4">
                    {/* よく使う目標語数プリセット */}
                    <div>
                      <div className="text-xs font-bold text-slate-600 mb-2">よく使う語数から選ぶ</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {TARGET_WORD_PRESETS.map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() =>
                              setCurrentRules((prev) => ({
                                ...prev,
                                targetWordCount: cnt,
                              }))
                            }
                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              (currentRules.targetWordCount || 20) === cnt
                                ? 'bg-amber-500 text-white shadow-xs scale-105'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {cnt}語
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 任意の語数入力 */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>任意の語数で設定</span>
                        <span className="text-xs font-black text-amber-600">
                          現在: 目標 {currentRules.targetWordCount || 20}語
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentRules.targetWordCount || 20;
                            if (cur > 2) {
                              setCurrentRules((prev) => ({
                                ...prev,
                                targetWordCount: cur - 1,
                              }));
                            }
                          }}
                          disabled={(currentRules.targetWordCount || 20) <= 2}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-lg text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="2"
                            max="200"
                            value={currentRules.targetWordCount || 20}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) {
                                const clamped = Math.min(200, Math.max(2, val));
                                setCurrentRules((prev) => ({
                                  ...prev,
                                  targetWordCount: clamped,
                                }));
                              }
                            }}
                            className="w-24 text-center text-xl font-black py-1.5 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-hidden bg-amber-50/50 text-slate-800"
                          />
                          <span className="text-sm font-bold text-slate-600">語</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentRules.targetWordCount || 20;
                            if (cur < 200) {
                              setCurrentRules((prev) => ({
                                ...prev,
                                targetWordCount: cur + 1,
                              }));
                            }
                          }}
                          disabled={(currentRules.targetWordCount || 20) >= 200}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-lg text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 text-center">
                        ※ 2語〜200語の間で設定できます
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            閉じる
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 max-w-xs px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white rounded-2xl text-sm sm:text-base font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="apply-rules-btn"
          >
            <Check className="w-5 h-5" />
            <span>決定</span>
          </button>
        </div>
      </div>
    </div>
  );
};
