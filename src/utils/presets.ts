import { GameRuleConfig } from '../types';
import { DEFAULT_RULES, GENRE_OPTIONS } from './constants';

export interface PresetRuleInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  config: Partial<GameRuleConfig>;
}

export const PRESET_BUNDLES: PresetRuleInfo[] = [
  {
    id: 'standard',
    name: 'ノーマル',
    emoji: '🟢',
    description: '縛りなしの基本しりとり。誰でも気軽に遊べます。',
    config: { ...DEFAULT_RULES },
  },
  {
    id: 'food_battle',
    name: 'もぐもぐ食べ物バトル',
    emoji: '🍎',
    description: '食べ物縛り＋3〜5文字＋3分制限！',
    config: {
      ...DEFAULT_RULES,
      genreEnabled: true,
      selectedGenres: ['食べ物', '果物', '野菜', '飲み物'],
      charCountMode: 'range',
      minCount: 3,
      maxCount: 5,
      timerEnabled: true,
      timerMinutes: 3,
      timerSeconds: 180,
    },
  },
  {
    id: 'word_length_rush',
    name: 'だんだん長くなる！',
    emoji: '📈',
    description: '3文字→4文字→5文字…ターンごとに必要な文字数が増える！3分勝負！',
    config: {
      ...DEFAULT_RULES,
      incrementalLength: true,
      incrementalStartCount: 3,
      timerEnabled: true,
      timerMinutes: 3,
      timerSeconds: 180,
    },
  },
  {
    id: 'clean_kana',
    name: '濁点・小文字なし',
    emoji: '✨',
    description: 'が・ざ等の濁点や「っ・ゃ・ゅ」などの小文字が使えない美しいしりとり。',
    config: {
      ...DEFAULT_RULES,
      noDakuonHandakuon: true,
      noSmallKana: true,
      timerEnabled: true,
      timerMinutes: 2,
      timerSeconds: 120,
    },
  },
  {
    id: 'speed_master',
    name: '1分集中スピード戦',
    emoji: '⚡',
    description: '1分間の全体時間制限＋前の文字数被り禁止！集中して言葉をつなごう！',
    config: {
      ...DEFAULT_RULES,
      timerEnabled: true,
      timerMinutes: 1,
      timerSeconds: 60,
      noSameLengthAsPrev: true,
    },
  },
];

/**
 * Generates a random set of 2 to 4 rules according to specification #15
 */
export function generateOmakaseRules(): { rules: GameRuleConfig; summaryList: string[] } {
  const newRules: GameRuleConfig = { ...DEFAULT_RULES };
  const summaryList: string[] = [];

  // Pool of independent rule candidate generators
  const ruleGenerators = [
    // 1. Character count
    () => {
      const modes = ['fixed3', 'fixed4', 'range35', 'range46', 'incremental'];
      const choice = modes[Math.floor(Math.random() * modes.length)];
      if (choice === 'fixed3') {
        newRules.charCountMode = 'fixed';
        newRules.fixedCount = 3;
        summaryList.push('3文字');
      } else if (choice === 'fixed4') {
        newRules.charCountMode = 'fixed';
        newRules.fixedCount = 4;
        summaryList.push('4文字');
      } else if (choice === 'range35') {
        newRules.charCountMode = 'range';
        newRules.minCount = 3;
        newRules.maxCount = 5;
        summaryList.push('3〜5文字');
      } else if (choice === 'range46') {
        newRules.charCountMode = 'range';
        newRules.minCount = 4;
        newRules.maxCount = 6;
        summaryList.push('4〜6文字');
      } else {
        newRules.incrementalLength = true;
        newRules.incrementalStartCount = 3;
        summaryList.push('文字数増加');
      }
    },
    // 2. Genre
    () => {
      const genres = ['食べ物', '動物', '乗り物', '生き物', '家にあるもの'];
      const pickedGenre = genres[Math.floor(Math.random() * genres.length)];
      newRules.genreEnabled = true;
      newRules.selectedGenres = [pickedGenre];
      summaryList.push(`${pickedGenre}限定`);
    },
    // 3. Timer
    () => {
      const times = [1, 2, 3, 5];
      const pickedTime = times[Math.floor(Math.random() * times.length)];
      newRules.timerEnabled = true;
      newRules.timerMinutes = pickedTime;
      newRules.timerSeconds = pickedTime * 60;
      summaryList.push(`${pickedTime}分`);
    },
    // 4. Character mechanics
    () => {
      const choices = ['noDakuon', 'noSmall', 'noSameLen'];
      const pick = choices[Math.floor(Math.random() * choices.length)];
      if (pick === 'noDakuon') {
        newRules.noDakuonHandakuon = true;
        summaryList.push('濁点・半濁点禁止');
      } else if (pick === 'noSmall') {
        newRules.noSmallKana = true;
        summaryList.push('小文字禁止');
      } else {
        newRules.noSameLengthAsPrev = true;
        summaryList.push('前のプレイヤーと同じ文字数禁止');
      }
    },
    // 5. Initial / Common char
    () => {
      const choices = ['noReusedInitial', 'mustIncludePrevChar'];
      const pick = choices[Math.floor(Math.random() * choices.length)];
      if (pick === 'noReusedInitial') {
        newRules.noReusedInitial = true;
        summaryList.push('頭文字重複禁止');
      } else {
        newRules.mustIncludePrevChar = true;
        summaryList.push('同文字含む');
      }
    },
  ];

  // Pick 2 to 4 unique rule categories
  const countToPick = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
  const shuffled = [...ruleGenerators].sort(() => 0.5 - Math.random());
  for (let i = 0; i < countToPick; i++) {
    shuffled[i]();
  }

  return { rules: newRules, summaryList };
}

/**
 * Formats active rules into a concise string badge (e.g. "食べ物｜3〜5文字｜10秒")
 * Per specification #14 & #23
 */
export function formatActiveRulesSummary(rules: GameRuleConfig): string[] {
  const parts: string[] = [];

  // Genre
  if (rules.genreEnabled && rules.selectedGenres.length > 0) {
    if (rules.selectedGenres.length === 1) {
      parts.push(`${rules.selectedGenres[0]}限定`);
    } else {
      parts.push(`${rules.selectedGenres.slice(0, 2).join('・')}${rules.selectedGenres.length > 2 ? '等' : ''}限定`);
    }
  }

  // Theme
  if (rules.themeEnabled && rules.themeText) {
    parts.push(`「${rules.themeText}」`);
  }

  // Char count
  if (rules.incrementalLength || rules.progressiveLengthIncrease) {
    parts.push('文字数増加');
  } else if (rules.charCountMode === 'fixed') {
    parts.push(`${rules.fixedCount}文字`);
  } else if (rules.charCountMode === 'range') {
    parts.push(rules.rangeNoUpperLimit ? `${rules.minCount}文字以上` : `${rules.minCount}〜${rules.maxCount}文字`);
  }

  if (rules.noSameLengthAsPrev) {
    parts.push('前のプレイヤーと同じ文字数禁止');
  }

  // Timer
  if (rules.timerEnabled) {
    const mins = rules.timerMinutes || (rules.timerSeconds ? Math.round(rules.timerSeconds / 60) : 3);
    parts.push(`${mins}分制限`);
  }

  // Target word count
  if (rules.targetWordCountEnabled && rules.targetWordCount > 0) {
    parts.push(`目標${rules.targetWordCount}語`);
  }

  // Kana restrictions
  if (rules.noDakuonHandakuon) parts.push('濁点禁止');
  if (rules.noSmallKana) parts.push('小文字禁止');
  if (rules.noReusedInitial) parts.push('頭文字重複禁止');
  if (rules.targetInitialsEnabled && rules.targetInitials.length > 0) {
    parts.push(`頭文字クリア[${rules.targetInitials.join(',')}]`);
  }
  if (rules.mustIncludePrevChar) parts.push('同文字含む');
  if (rules.noCommonCharExceptLink) parts.push('文字被り禁止');
  if (rules.forbiddenLetters.length > 0) {
    parts.push(`頭文字「${rules.forbiddenLetters.join(',')}」禁止`);
  }
  if (rules.forbiddenContains.length > 0) {
    parts.push(`「${rules.forbiddenContains.join(',')}」禁止`);
  }
  if (rules.noKatakana) parts.push('カタカナ禁止');
  if (rules.onlyHiragana) parts.push('ひらがなのみ');

  return parts;
}

export interface RuleItem {
  id: string;
  label: string;
  category: 'players' | 'length' | 'genre' | 'kana' | 'timer' | 'target';
}

/**
 * Returns a list of active individual rules with unique IDs and remove handlers.
 * Allows users to inspect and delete rules one by one (e.g. from Omakase or manual selection).
 */
export function getActiveRuleItems(rules: GameRuleConfig): RuleItem[] {
  const items: RuleItem[] = [];

  // Genre
  if (rules.genreEnabled && rules.selectedGenres.length > 0) {
    const label =
      rules.selectedGenres.length === 1
        ? `${rules.selectedGenres[0]}限定`
        : `${rules.selectedGenres.slice(0, 2).join('・')}${rules.selectedGenres.length > 2 ? '等' : ''}限定`;
    items.push({ id: 'genre', label, category: 'genre' });
  }

  // Theme
  if (rules.themeEnabled && rules.themeText) {
    items.push({ id: 'theme', label: `「${rules.themeText}」`, category: 'genre' });
  }

  // Incremental length
  if (rules.incrementalLength || rules.progressiveLengthIncrease) {
    items.push({ id: 'incrementalLength', label: '文字数増加', category: 'length' });
  } else if (rules.charCountMode === 'fixed') {
    items.push({ id: 'fixedLength', label: `${rules.fixedCount}文字`, category: 'length' });
  } else if (rules.charCountMode === 'range') {
    const label = rules.rangeNoUpperLimit
      ? `${rules.minCount}文字以上`
      : `${rules.minCount}〜${rules.maxCount}文字`;
    items.push({ id: 'rangeLength', label, category: 'length' });
  }

  // No same length
  if (rules.noSameLengthAsPrev) {
    items.push({ id: 'noSameLength', label: '前の人と同じ文字数禁止', category: 'length' });
  }

  // Timer
  if (rules.timerEnabled) {
    const mins = rules.timerMinutes || (rules.timerSeconds ? Math.round(rules.timerSeconds / 60) : 3);
    items.push({ id: 'timer', label: `${mins}分制限`, category: 'timer' });
  }

  // Target word count
  if (rules.targetWordCountEnabled && rules.targetWordCount > 0) {
    items.push({ id: 'targetWordCount', label: `目標${rules.targetWordCount}語`, category: 'target' });
  }

  // Target initials to clear
  if (rules.targetInitialsEnabled && rules.targetInitials.length > 0) {
    items.push({
      id: 'targetInitials',
      label: `頭文字クリア[${rules.targetInitials.join(',')}]`,
      category: 'kana',
    });
  }

  // Kana restrictions
  if (rules.noDakuonHandakuon) {
    items.push({ id: 'noDakuon', label: '濁点禁止', category: 'kana' });
  }
  if (rules.noSmallKana) {
    items.push({ id: 'noSmallKana', label: '小文字禁止', category: 'kana' });
  }
  if (rules.noReusedInitial) {
    items.push({ id: 'noReusedInitial', label: '頭文字重複禁止', category: 'kana' });
  }
  if (rules.mustIncludePrevChar) {
    items.push({ id: 'mustIncludePrevChar', label: '同文字含む', category: 'kana' });
  }
  if (rules.noCommonCharExceptLink) {
    items.push({ id: 'noCommonChar', label: '文字被り禁止', category: 'kana' });
  }
  if (rules.forbiddenLetters && rules.forbiddenLetters.length > 0) {
    items.push({
      id: 'forbiddenLetters',
      label: `頭文字「${rules.forbiddenLetters.join(',')}」禁止`,
      category: 'kana',
    });
  }
  if (rules.forbiddenContains && rules.forbiddenContains.length > 0) {
    items.push({
      id: 'forbiddenContains',
      label: `「${rules.forbiddenContains.join(',')}」禁止`,
      category: 'kana',
    });
  }
  if (rules.noKatakana) {
    items.push({ id: 'noKatakana', label: 'カタカナ禁止', category: 'kana' });
  }
  if (rules.onlyHiragana) {
    items.push({ id: 'onlyHiragana', label: 'ひらがなのみ', category: 'kana' });
  }
  if (rules.properNounOnly) {
    items.push({ id: 'properNounOnly', label: '固有名詞のみ', category: 'kana' });
  }
  if (rules.tangibleOnly) {
    items.push({ id: 'tangibleOnly', label: '実物があるもの限定', category: 'kana' });
  }
  if (rules.noAbstract) {
    items.push({ id: 'noAbstract', label: '抽象的な言葉禁止', category: 'kana' });
  }
  if (rules.kanjiExpressible) {
    items.push({ id: 'kanjiExpressible', label: '漢字表記できる言葉のみ', category: 'kana' });
  }

  return items;
}

/**
 * Removes a specific rule by its ID while keeping other rules and player configs intact.
 */
export function removeRuleById(rules: GameRuleConfig, ruleId: string): GameRuleConfig {
  const updated: GameRuleConfig = { ...rules };

  switch (ruleId) {
    case 'genre':
      updated.genreEnabled = false;
      updated.selectedGenres = [];
      break;
    case 'theme':
      updated.themeEnabled = false;
      updated.themeText = '';
      break;
    case 'incrementalLength':
      updated.incrementalLength = false;
      updated.progressiveLengthIncrease = false;
      break;
    case 'fixedLength':
    case 'rangeLength':
      updated.charCountMode = 'none';
      break;
    case 'noSameLength':
      updated.noSameLengthAsPrev = false;
      break;
    case 'timer':
      updated.timerEnabled = false;
      break;
    case 'targetWordCount':
      updated.targetWordCountEnabled = false;
      break;
    case 'targetInitials':
      updated.targetInitialsEnabled = false;
      updated.targetInitials = [];
      break;
    case 'noDakuon':
      updated.noDakuonHandakuon = false;
      break;
    case 'noSmallKana':
      updated.noSmallKana = false;
      break;
    case 'noReusedInitial':
      updated.noReusedInitial = false;
      break;
    case 'mustIncludePrevChar':
      updated.mustIncludePrevChar = false;
      break;
    case 'noCommonChar':
      updated.noCommonCharExceptLink = false;
      break;
    case 'forbiddenLetters':
      updated.forbiddenLetters = [];
      break;
    case 'forbiddenContains':
      updated.forbiddenContains = [];
      break;
    case 'noKatakana':
      updated.noKatakana = false;
      break;
    case 'onlyHiragana':
      updated.onlyHiragana = false;
      break;
    case 'properNounOnly':
      updated.properNounOnly = false;
      break;
    case 'tangibleOnly':
      updated.tangibleOnly = false;
      break;
    case 'noAbstract':
      updated.noAbstract = false;
      break;
    case 'kanjiExpressible':
      updated.kanjiExpressible = false;
      break;
    default:
      break;
  }

  return updated;
}

