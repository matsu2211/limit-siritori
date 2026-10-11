/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { GameBoard } from './components/GameBoard';
import { HistoryTrail } from './components/HistoryTrail';
import { RuleSettingsModal } from './components/RuleSettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { GameRuleConfig, WordEntry, PlayerInfo } from './types';
import {
  DEFAULT_RULES,
  PLAYER_COLORS,
  INITIAL_WORD_CANDIDATES,
} from './utils/constants';
import {
  validateShiritoriWord,
  getNextRequiredChar,
  toHiragana,
} from './utils/shiritori';
import {
  playSuccessSound,
  playErrorSound,
  playTickSound,
  playGameOverSound,
  setSoundMuted,
} from './utils/sound';
import { generateOmakaseRules } from './utils/presets';

const STORAGE_RULES_KEY = 'shiritori_maker_rules_v1';
const STORAGE_MUTE_KEY = 'shiritori_maker_muted_v1';

export default function App() {
  // Load saved rules or use default
  const [rules, setRules] = useState<GameRuleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RULES_KEY);
      if (saved) {
        return { ...DEFAULT_RULES, ...JSON.parse(saved) };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_RULES;
  });

  // Sound mute state
  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Game Phases: 'start' | 'playing' | 'gameover'
  const [phase, setPhase] = useState<'start' | 'playing' | 'gameover'>('start');

  // Game State
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [requiredChar, setRequiredChar] = useState<string>('ご');
  const [history, setHistory] = useState<WordEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentMaxTime, setCurrentMaxTime] = useState<number>(10);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Pass notice banner
  const [passNotice, setPassNotice] = useState<string | null>(null);
  const passNoticeTimerRef = useRef<number | null>(null);

  // Modals
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [rulesInitialCategory, setRulesInitialCategory] = useState<
    'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target'
  >('players');
  const [rulesSingleCategoryMode, setRulesSingleCategoryMode] = useState<boolean>(false);

  const handleOpenRules = (
    category: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target' = 'players',
    singleCategory: boolean = false
  ) => {
    setRulesInitialCategory(category);
    setRulesSingleCategoryMode(singleCategory);
    setIsRulesModalOpen(true);
  };

  const [gameOverReason, setGameOverReason] = useState<{
    lastWord?: string;
    cause: 'ended_with_n' | 'timeout' | 'surrender' | 'target_reached';
    message: string;
  } | null>(null);

  // Save rules to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RULES_KEY, JSON.stringify(rules));
    } catch (e) {
      // safe fallback
    }
  }, [rules]);

  // Sync mute state with audio synth
  useEffect(() => {
    setSoundMuted(isMuted);
    try {
      localStorage.setItem(STORAGE_MUTE_KEY, String(isMuted));
    } catch (e) {
      // safe fallback
    }
  }, [isMuted]);

  const handleToggleMute = () => {
    setIsMutedState((prev) => !prev);
  };

  // Determine active players based on playerMode
  const activePlayers: PlayerInfo[] = React.useMemo(() => {
    const customNames = rules.playerNames || [];
    if (rules.playerMode === 'solo') {
      return [
        {
          id: 0,
          name: customNames[0]?.trim() || 'プレイヤー',
          color: '🟢',
          iconBg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          textColor: 'text-emerald-600',
        },
      ];
    }
    if (rules.playerMode === 'duo') {
      return PLAYER_COLORS.slice(0, 2).map((p, idx) => ({
        ...p,
        name: customNames[idx]?.trim() || p.name,
      }));
    }
    // Group mode: 3 to 6
    const count = Math.min(Math.max(rules.groupCount || 3, 3), 6);
    return PLAYER_COLORS.slice(0, count).map((p, idx) => ({
      ...p,
      name: customNames[idx]?.trim() || p.name,
    }));
  }, [rules.playerMode, rules.groupCount, rules.playerNames]);

  // Start a fresh game
  const startNewGame = useCallback(() => {
    // Pick an initial starting word
    const starterCandidate =
      INITIAL_WORD_CANDIDATES[
        Math.floor(Math.random() * INITIAL_WORD_CANDIDATES.length)
      ];

    const initialEntry: WordEntry = {
      id: `word-0`,
      word: starterCandidate.word,
      hiragana: starterCandidate.reading,
      playerIndex: 0,
      turn: 1,
      charCount: starterCandidate.word.length,
      timestamp: Date.now(),
    };

    const nextChar = getNextRequiredChar(starterCandidate.word);

    setHistory([initialEntry]);
    setRequiredChar(nextChar);
    setCurrentTurn(1);
    setActivePlayerIndex(0);
    setErrorMessage(null);
    setGameOverReason(null);

    // Initial timer (overall game limit in seconds)
    const totalMinutes = rules.timerMinutes || (rules.timerSeconds ? rules.timerSeconds / 60 : 3);
    const baseTimeSeconds = rules.timerEnabled ? Math.round(totalMinutes * 60) : 180;
    setCurrentMaxTime(baseTimeSeconds);
    setTimeLeft(baseTimeSeconds);
    setIsTimerRunning(true);

    setPhase('playing');
  }, [rules]);

  // Restart current game (same rules)
  const handleRestart = () => {
    startNewGame();
  };

  // Return to home screen
  const handleGoHome = () => {
    setPhase('start');
    setGameOverReason(null);
    setErrorMessage(null);
  };

  // 🎲 Quick Omakase on Start screen
  const handleQuickOmakase = () => {
    const { rules: randomRules } = generateOmakaseRules();
    randomRules.playerMode = rules.playerMode;
    randomRules.groupCount = rules.groupCount;
    setRules(randomRules);
  };

  // Toggle timer play / pause
  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  // Timer Tick Effect (Overall game timer)
  useEffect(() => {
    if (phase !== 'playing' || !rules.timerEnabled || !isTimerRunning || isRulesModalOpen) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Total game time expired!
          clearInterval(timer);
          playGameOverSound();
          setGameOverReason({
            cause: 'timeout',
            message: '制限時間終了！ゲーム終了です',
          });
          setPhase('gameover');
          return 0;
        }

        // Sound tick in last 3 seconds
        if (prev <= 4) {
          playTickSound();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, rules.timerEnabled, isTimerRunning, isRulesModalOpen]);

  // Handle word submission
  const handleSubmitWord = (inputWord: string) => {
    setErrorMessage(null);

    // Validate using comprehensive validator
    const validation = validateShiritoriWord(
      inputWord,
      requiredChar,
      history,
      rules,
      currentTurn
    );

    // 1. Ended with 'ん' -> Game Over!
    if (validation.isGameOver && validation.cause === 'ended_with_n') {
      playGameOverSound();
      setGameOverReason({
        lastWord: inputWord,
        cause: 'ended_with_n',
        message: validation.reason || `「${inputWord}」の「ん」で終了`,
      });
      setPhase('gameover');
      return;
    }

    // 2. Rule violation or invalid
    if (!validation.valid) {
      playErrorSound();
      setErrorMessage(validation.reason || '無効な言葉です');
      return;
    }

    // 3. Valid Word!
    playSuccessSound();
    setPassNotice(null);

    // Next Required Character
    const nextChar = getNextRequiredChar(inputWord);

    // Create entry
    const newEntry: WordEntry = {
      id: `word-${Date.now()}`,
      word: inputWord,
      hiragana: toHiragana(inputWord),
      playerIndex: activePlayerIndex,
      turn: currentTurn + 1,
      charCount: inputWord.length,
      timestamp: Date.now(),
    };

    const newHistory = [...history, newEntry];
    setHistory(newHistory);
    setRequiredChar(nextChar);
    setCurrentTurn((prev) => prev + 1);

    // Check if target word count reached
    const answeredCount = newHistory.length - 1;
    if (rules.targetWordCountEnabled && rules.targetWordCount > 0 && answeredCount >= rules.targetWordCount) {
      playSuccessSound();
      setGameOverReason({
        lastWord: inputWord,
        cause: 'target_reached',
        message: `目標の${rules.targetWordCount}語を達成しました！おめでとうございます！🎉`,
      });
      setPhase('gameover');
      return;
    }

    // Check if target initials mission cleared
    if (rules.targetInitialsEnabled && rules.targetInitials.length > 0) {
      const answeredInitials = new Set(
        newHistory.slice(1).map((h) => toHiragana(h.word)[0])
      );
      const allInitialsCleared = rules.targetInitials.every((char) =>
        answeredInitials.has(char)
      );
      if (allInitialsCleared) {
        playSuccessSound();
        setGameOverReason({
          lastWord: inputWord,
          cause: 'initials_cleared',
          message: `目標の頭文字【${rules.targetInitials.join('・')}】をすべてクリアしました！大成功です！🎉`,
        });
        setPhase('gameover');
        return;
      }
    }

    // Cycle to next player
    setActivePlayerIndex((prev) => (prev + 1) % activePlayers.length);
  };

  // Handle Pass (No surrender - switches turn to next player)
  const handlePass = () => {
    playTickSound();
    setErrorMessage(null);

    const passingPlayer = activePlayers[activePlayerIndex % activePlayers.length];
    const nextPlayerIndex = (activePlayerIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextPlayerIndex];

    // Switch to next player
    setActivePlayerIndex(nextPlayerIndex);

    // Set brief notice
    const notice =
      activePlayers.length > 1
        ? `${passingPlayer.name}がパス → 次: ${nextPlayer.name}`
        : `パスしました`;
    setPassNotice(notice);

    if (passNoticeTimerRef.current) {
      window.clearTimeout(passNoticeTimerRef.current);
    }
    passNoticeTimerRef.current = window.setTimeout(() => {
      setPassNotice(null);
    }, 3000);
  };

  const currentPrevWord = history.length > 0 ? history[history.length - 1].word : '';
  const currentActivePlayer =
    activePlayers[activePlayerIndex % activePlayers.length] || activePlayers[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-amber-50/70 flex flex-col text-slate-800">
      {/* Top Header */}
      <Header
        rules={rules}
        onOpenRules={() => handleOpenRules()}
        onRestart={handleRestart}
        onGoHome={handleGoHome}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        inGame={phase === 'playing' || phase === 'gameover'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col justify-between">
        {phase === 'start' && (
          <StartScreen
            rules={rules}
            onUpdateRules={setRules}
            onStartGame={startNewGame}
            onOpenRules={handleOpenRules}
            onQuickOmakase={handleQuickOmakase}
          />
        )}

        {(phase === 'playing' || phase === 'gameover') && (
          <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-4 flex-1">
            <GameBoard
              currentWord={currentPrevWord}
              requiredChar={requiredChar}
              currentTurn={currentTurn}
              activePlayer={currentActivePlayer}
              players={activePlayers}
              history={history}
              rules={rules}
              timeLeft={timeLeft}
              maxTime={currentMaxTime}
              isTimerRunning={isTimerRunning}
              onToggleTimer={handleToggleTimer}
              errorMessage={phase === 'gameover' ? null : errorMessage}
              passNotice={passNotice}
              onSubmitWord={phase === 'gameover' ? () => {} : handleSubmitWord}
              onPass={phase === 'gameover' ? () => {} : handlePass}
              onOpenRules={(cat, single) => handleOpenRules(cat || 'length', single ?? false)}
            />

            {/* Bottom Area: Shiritori History Trail */}
            <HistoryTrail history={history} rules={rules} />
          </div>
        )}
      </main>

      {/* Rule Settings Modal (Specification #5 - #15) */}
      <RuleSettingsModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        initialCategory={rulesInitialCategory}
        singleCategoryMode={rulesSingleCategoryMode}
        onSaveRules={(newRules) => {
          setRules(newRules);
          // If in game and timer changed, update current timer
          if (newRules.timerEnabled) {
            const mins = newRules.timerMinutes || (newRules.timerSeconds ? newRules.timerSeconds / 60 : 3);
            const totalSec = Math.round(mins * 60);
            setCurrentMaxTime(totalSec);
            setTimeLeft(totalSec);
          }
        }}
      />

      {/* Game Over Modal (Specification #20) */}
      <GameOverModal
        isOpen={phase === 'gameover'}
        reason={gameOverReason}
        history={history}
        players={activePlayers}
        rules={rules}
        onPlayAgain={startNewGame}
        onChangeRules={() => {
          setIsRulesModalOpen(true);
        }}
        onGoHome={handleGoHome}
      />
    </div>
  );
}
