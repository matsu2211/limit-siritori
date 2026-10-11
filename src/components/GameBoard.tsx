import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Clock,
  Play,
  Pause,
  AlertCircle,
  SkipForward,
  Link2,
  Sparkles,
  Target,
  Check,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GameRuleConfig, WordEntry, PlayerInfo } from '../types';
import {
  toHiragana,
  containsKatakana,
  hasDakuonOrHandakuon,
  hasSmallKana,
} from '../utils/shiritori';
import { ActiveRulesBadge } from './ActiveRulesBadge';

interface GameBoardProps {
  currentWord: string;
  requiredChar: string;
  currentTurn: number;
  activePlayer: PlayerInfo;
  players: PlayerInfo[];
  history: WordEntry[];
  rules: GameRuleConfig;
  timeLeft: number;
  maxTime: number;
  isTimerRunning?: boolean;
  onToggleTimer?: () => void;
  errorMessage: string | null;
  passNotice?: string | null;
  onSubmitWord: (word: string) => void;
  onPass: () => void;
  onOpenRules: (
    category?: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target',
    singleCategory?: boolean
  ) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  currentWord,
  requiredChar,
  currentTurn,
  activePlayer,
  players,
  history,
  rules,
  timeLeft,
  maxTime,
  isTimerRunning = true,
  onToggleTimer,
  errorMessage,
  passNotice,
  onSubmitWord,
  onPass,
  onOpenRules,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Count of connected words (history minus starting word)
  const connectedWordsCount = Math.max(0, history.length - 1);
  const [displayCount, setDisplayCount] = useState<number>(connectedWordsCount);
  const [isBumping, setIsBumping] = useState<boolean>(false);
  const [showPlusOne, setShowPlusOne] = useState<boolean>(false);
  const prevCountRef = useRef<number>(connectedWordsCount);

  // Animated Count-up Effect whenever a word connects
  useEffect(() => {
    if (connectedWordsCount > prevCountRef.current) {
      setIsBumping(true);
      setShowPlusOne(true);

      const target = connectedWordsCount;
      const start = prevCountRef.current;
      let curr = start;

      const stepInterval = setInterval(() => {
        curr += 1;
        setDisplayCount(curr);
        if (curr >= target) {
          clearInterval(stepInterval);
        }
      }, 100);

      const bumpTimer = setTimeout(() => {
        setIsBumping(false);
        setShowPlusOne(false);
      }, 1400);

      prevCountRef.current = connectedWordsCount;
      return () => {
        clearInterval(stepInterval);
        clearTimeout(bumpTimer);
      };
    } else {
      setDisplayCount(connectedWordsCount);
      prevCountRef.current = connectedWordsCount;
    }
  }, [connectedWordsCount]);

  // Auto focus and clear input on each turn or pass
  useEffect(() => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentTurn, requiredChar, activePlayer.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let wordToSubmit = inputValue.trim();
    onSubmitWord(wordToSubmit);
  };

  // Target initials mission calculation
  const answeredInitials = useMemo(() => {
    return new Set(history.slice(1).map((h) => toHiragana(h.word)[0]));
  }, [history]);

  const clearedTargetInitialsCount = useMemo(() => {
    if (!rules.targetInitialsEnabled || !rules.targetInitials) return 0;
    return rules.targetInitials.filter((c) => answeredInitials.has(c)).length;
  }, [rules.targetInitialsEnabled, rules.targetInitials, answeredInitials]);

  // Is current required char a target initial mission candidate?
  const isTargetInitialOpportunity = useMemo(() => {
    return (
      rules.targetInitialsEnabled &&
      rules.targetInitials &&
      rules.targetInitials.includes(requiredChar) &&
      !answeredInitials.has(requiredChar)
    );
  }, [rules.targetInitialsEnabled, rules.targetInitials, requiredChar, answeredInitials]);

  // Calculate timer percentage
  const timerPercentage = maxTime > 0 ? Math.max(0, (timeLeft / maxTime) * 100) : 100;
  const isTimeCritical = rules.timerEnabled && timeLeft <= 3;

  // Next player hint if multiplayer
  const nextPlayer =
    players.length > 1
      ? players[(players.findIndex((p) => p.id === activePlayer.id) + 1) % players.length]
      : null;

  // Real-time Live Evaluation of current input text as user types
  const liveEvaluation = useMemo(() => {
    const text = inputValue.trim();
    if (!text) return null;

    const hira = toHiragana(text);
    const charCount = text.length;
    const firstHira = hira[0] || '';
    const lastHira = hira[hira.length - 1] || '';

    // 1. Initial character check
    const isStartValid = firstHira === requiredChar;

    // 2. Length check
    let lengthOk = true;
    let lengthMsg = `${charCount}文字`;
    let lengthColor = 'text-slate-700 bg-slate-100 border-slate-300';

    if (rules.charCountMode === 'fixed') {
      const target = rules.fixedCount;
      if (charCount === target) {
        lengthOk = true;
        lengthMsg = `✓ ${charCount}/${target}文字 (OK)`;
        lengthColor = 'text-emerald-800 bg-emerald-50 border-emerald-300';
      } else if (charCount < target) {
        lengthOk = false;
        lengthMsg = `${charCount}/${target}文字 (あと${target - charCount}文字)`;
        lengthColor = 'text-amber-800 bg-amber-50 border-amber-300';
      } else {
        lengthOk = false;
        lengthMsg = `${charCount}/${target}文字 (${charCount - target}文字オーバー)`;
        lengthColor = 'text-rose-800 bg-rose-50 border-rose-300';
      }
    } else if (rules.charCountMode === 'range') {
      if (rules.rangeNoUpperLimit) {
        if (charCount >= rules.minCount) {
          lengthOk = true;
          lengthMsg = `✓ ${charCount}文字 (${rules.minCount}文字以上 OK)`;
          lengthColor = 'text-emerald-800 bg-emerald-50 border-emerald-300';
        } else {
          lengthOk = false;
          lengthMsg = `${charCount}文字 (あと${rules.minCount - charCount}文字必要)`;
          lengthColor = 'text-amber-800 bg-amber-50 border-amber-300';
        }
      } else {
        if (charCount >= rules.minCount && charCount <= rules.maxCount) {
          lengthOk = true;
          lengthMsg = `✓ ${charCount}文字 (${rules.minCount}〜${rules.maxCount}文字 OK)`;
          lengthColor = 'text-emerald-800 bg-emerald-50 border-emerald-300';
        } else if (charCount < rules.minCount) {
          lengthOk = false;
          lengthMsg = `${charCount}文字 (最小${rules.minCount}文字)`;
          lengthColor = 'text-amber-800 bg-amber-50 border-amber-300';
        } else {
          lengthOk = false;
          lengthMsg = `${charCount}文字 (最大${rules.maxCount}文字)`;
          lengthColor = 'text-rose-800 bg-rose-50 border-rose-300';
        }
      }
    } else if (rules.incrementalLength) {
      const target = rules.incrementalStartCount + currentTurn - 1;
      if (charCount === target) {
        lengthOk = true;
        lengthMsg = `✓ ${charCount}/${target}文字 (OK)`;
        lengthColor = 'text-emerald-800 bg-emerald-50 border-emerald-300';
      } else if (charCount < target) {
        lengthOk = false;
        lengthMsg = `${charCount}/${target}文字 (あと${target - charCount}文字)`;
        lengthColor = 'text-amber-800 bg-amber-50 border-amber-300';
      } else {
        lengthOk = false;
        lengthMsg = `${charCount}/${target}文字 (${charCount - target}文字オーバー)`;
        lengthColor = 'text-rose-800 bg-rose-50 border-rose-300';
      }
    }

    // 3. No same length constraint
    const isSameLengthViolation =
      rules.noSameLengthAsPrev && currentWord && charCount === currentWord.length;

    // 4. Live warnings for rule violations
    const warnings: string[] = [];
    if (lastHira === 'ん') {
      warnings.push('「ん」で終わるとゲーム終了');
    }
    if (rules.noKatakana && containsKatakana(text)) {
      warnings.push('カタカナが含まれています');
    }
    if (rules.noDakuonHandakuon && hasDakuonOrHandakuon(text)) {
      warnings.push('濁点・半濁点が含まれています');
    }
    if (rules.noSmallKana && hasSmallKana(text)) {
      warnings.push('小文字が含まれています');
    }
    if (rules.forbiddenLetters && rules.forbiddenLetters.includes(firstHira)) {
      warnings.push(`禁止頭文字「${firstHira}」`);
    }
    if (rules.forbiddenContains && rules.forbiddenContains.some((c) => hira.includes(toHiragana(c)))) {
      warnings.push('禁止文字を含んでいます');
    }
    if (rules.mustIncludePrevChar && currentWord) {
      const prevChars = toHiragana(currentWord).split('');
      const containsOne = prevChars.some((c) => c !== 'ー' && hira.includes(c));
      if (!containsOne) {
        warnings.push(`「${currentWord}」の文字を含めてください`);
      }
    }

    const allConditionsPassed =
      isStartValid && lengthOk && !isSameLengthViolation && warnings.length === 0;

    return {
      isStartValid,
      lengthOk,
      lengthMsg,
      lengthColor,
      isSameLengthViolation,
      warnings,
      allConditionsPassed,
    };
  }, [inputValue, requiredChar, rules, currentTurn, currentWord]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Categorized Active Rules Overview Card */}
      <ActiveRulesBadge rules={rules} onOpenRules={onOpenRules} />

      {/* 2. Main Game Card */}
      <div className="w-full bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm relative overflow-hidden transition-all">
        {/* Top Control Bar / HUD: Turn, Players, Target/Words, Timer, Pass */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 mb-4 pb-3.5 border-b border-amber-100 flex-wrap">
          {/* Left: Player / Turn info */}
          <div className="flex items-center gap-2">
            {players.length > 1 ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-xs sm:text-sm border shadow-2xs ${activePlayer.badgeBg}`}
                >
                  <span>{activePlayer.color}</span>
                  <span>{activePlayer.name} の番</span>
                </span>
                {nextPlayer && (
                  <span className="text-[11px] text-slate-400 font-bold hidden sm:inline-block">
                    (次: {nextPlayer.name})
                  </span>
                )}
              </div>
            ) : (
              <span className="px-3 py-1 bg-amber-50 rounded-xl text-xs font-black text-amber-900 border border-amber-200/80">
                {currentTurn}ターン目
              </span>
            )}

          </div>

          {/* Right: Words/Target, Timer (MM:SS, no text on button), Pass */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto flex-wrap sm:flex-nowrap">
            {/* Word count / Target Goal */}
            <div className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-2xs border border-amber-300">
              {rules.targetWordCountEnabled ? (
                <Target className={`w-3.5 h-3.5 text-amber-200 ${isBumping ? 'animate-bounce' : ''}`} />
              ) : (
                <Link2 className={`w-3.5 h-3.5 text-amber-200 ${isBumping ? 'animate-spin' : ''}`} />
              )}
              <span
                className={`text-sm sm:text-base font-black font-mono px-0.5 transition-transform duration-300 inline-block ${
                  isBumping ? 'scale-125 text-yellow-200 font-black' : ''
                }`}
              >
                {displayCount}
              </span>
              {rules.targetWordCountEnabled ? (
                <span className="text-[11px] sm:text-xs font-bold text-amber-100 font-mono">
                  /{rules.targetWordCount}語
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-100">語</span>
              )}

              {/* Pop-up +1 Celebration */}
              {showPlusOne && (
                <span className="absolute -top-7 right-0 bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce ring-2 ring-white whitespace-nowrap">
                  +1
                </span>
              )}
            </div>

            {/* Timer Widget in Top Bar */}
            {rules.timerEnabled && (
              <div
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border transition-all ${
                  !isTimerRunning
                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                    : isTimeCritical
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-200'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <Clock
                  className={`w-3.5 h-3.5 ${
                    !isTimerRunning
                      ? 'text-slate-400'
                      : isTimeCritical
                      ? 'text-rose-500 animate-spin'
                      : 'text-amber-600'
                  }`}
                />
                <span className="text-[11px] font-bold text-slate-500 hidden md:inline">
                  残り時間
                </span>
                <span
                  className={`text-sm sm:text-base font-black font-mono tracking-wider ${
                    !isTimerRunning ? 'text-slate-600' : isTimeCritical ? 'text-rose-600' : 'text-amber-900'
                  }`}
                >
                  {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                  {String(timeLeft % 60).padStart(2, '0')}
                </span>

                {/* Start / Stop Toggle Button (icon only, NO text) */}
                {onToggleTimer && (
                  <button
                    type="button"
                    onClick={onToggleTimer}
                    aria-label={isTimerRunning ? '一時停止' : '再開'}
                    title={isTimerRunning ? '一時停止' : '再開'}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-2xs border cursor-pointer ${
                      isTimerRunning
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
                    }`}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Pass Button */}
            <button
              type="button"
              onClick={onPass}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 active:scale-95 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs border border-amber-300/80"
              id="pass-turn-btn"
            >
              <SkipForward className="w-3.5 h-3.5 text-amber-700" />
              <span>パス</span>
            </button>
          </div>
        </div>

        {/* Thin Timer Progress Bar */}
        {rules.timerEnabled && (
          <div className="w-full bg-slate-100 rounded-full h-1 -mt-2 mb-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                !isTimerRunning ? 'bg-slate-400' : isTimeCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}

        {/* Pass Notice Banner */}
        {passNotice && (
          <div className="w-full max-w-lg mx-auto mb-3 p-2 bg-amber-100/90 border border-amber-300 rounded-2xl text-amber-900 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold animate-pop shadow-2xs">
            <SkipForward className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{passNotice}</span>
          </div>
        )}

        {/* Target Initials Mission Tracker */}
        {rules.targetInitialsEnabled && rules.targetInitials.length > 0 && (
          <div className="w-full max-w-xl mx-auto mb-4 p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 rounded-2xl border border-emerald-300 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-black text-emerald-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>クリア目標の頭文字</span>
              </span>
              <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300/80">
                {clearedTargetInitialsCount} / {rules.targetInitials.length} クリア
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {rules.targetInitials.map((char) => {
                const isCleared = answeredInitials.has(char);
                const isNextCandidate = requiredChar === char && !isCleared;

                return (
                  <span
                    key={char}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                      isCleared
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : isNextCandidate
                        ? 'bg-amber-300 text-amber-950 ring-2 ring-amber-400 shadow-sm animate-pulse scale-105'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                    title={
                      isCleared
                        ? 'クリア済み！'
                        : isNextCandidate
                        ? '今がチャンス！（この文字から始まる言葉を言えます）'
                        : '未クリア'
                    }
                  >
                    <span>「{char}」</span>
                    {isCleared ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : isNextCandidate ? (
                      <span className="text-amber-800 font-black text-[10px]">★チャンス</span>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Central Word Link Hero */}
        <div className="flex flex-col items-center justify-center my-3 sm:my-5 text-center">
          {/* Previous Word */}
          {currentWord && (
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <span className="text-xs font-bold text-slate-400">前の言葉:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/90 rounded-xl text-sm sm:text-base font-black text-slate-800 shadow-2xs">
                <span>{currentWord}</span>
                <span className="text-[11px] text-slate-400 font-bold">({currentWord.length}文字)</span>
              </span>
            </div>
          )}

          {/* Big Required Letter Card */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md ring-4 ring-amber-200/70">
              {requiredChar}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800">
              から
            </div>
          </div>

          {/* Target Initial Opportunity Banner */}
          {isTargetInitialOpportunity && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300 text-xs font-black animate-pop shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>「{requiredChar}」は目標頭文字です！今クリアするチャンス！</span>
            </div>
          )}
        </div>

        {/* Input Form Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto flex flex-col gap-2 mt-2">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1 flex items-center">
              {/* Main Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`「${requiredChar}」から始まる言葉を入力...`}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="w-full px-4 pr-12 py-3.5 sm:py-4 bg-slate-50 hover:bg-white focus:bg-white text-xl sm:text-2xl font-bold text-slate-800 border-2 border-amber-300 focus:border-amber-500 rounded-2xl outline-hidden transition-all shadow-inner focus:ring-4 focus:ring-amber-200/50"
                id="shiritori-word-input"
              />

              {/* Clear button if text entered */}
              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="sm:w-32 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-black text-base sm:text-lg rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              id="shiritori-submit-btn"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>送信</span>
            </button>
          </div>

          {/* 4. Live Real-Time Rule Feedback Bar while typing */}
          {liveEvaluation && (
            <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs animate-pop">
              {/* Left: Validation Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. Start character check */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-black ${
                    liveEvaluation.isStartValid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {liveEvaluation.isStartValid ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {liveEvaluation.isStartValid
                      ? `「${requiredChar}」で開始`
                      : `「${requiredChar}」から始まっていません`}
                  </span>
                </span>

                {/* 2. Character length check */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-black ${liveEvaluation.lengthColor}`}
                >
                  <span>📏</span>
                  <span>{liveEvaluation.lengthMsg}</span>
                </span>

                {/* 3. Same length violation warning */}
                {liveEvaluation.isSameLengthViolation && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-black bg-rose-50 text-rose-800 border-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>前の言葉と同じ{currentWord.length}文字です</span>
                  </span>
                )}

                {/* 4. Rule-specific warnings */}
                {liveEvaluation.warnings.map((warn, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-black bg-rose-50 text-rose-800 border-rose-300"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{warn}</span>
                  </span>
                ))}
              </div>

              {/* Right: All clear indicator */}
              {liveEvaluation.allConditionsPassed && (
                <div className="flex items-center gap-1 text-emerald-700 font-black text-xs ml-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>条件クリア！</span>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Error Message Box */}
        {errorMessage && (
          <div className="w-full max-w-xl mx-auto mt-3 p-2.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-800 flex items-center gap-2.5 text-xs sm:text-sm animate-pop shadow-2xs font-bold">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
