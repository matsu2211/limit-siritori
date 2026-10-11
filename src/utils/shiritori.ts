import { GameRuleConfig, ValidationResult, WordEntry } from '../types';

/**
 * Converts Katakana to Hiragana and strips whitespace
 */
export function toHiragana(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    })
    // Also convert half-width katakana to full-width hiragana
    .replace(/[ｦ-ﾟ]/g, (ch) => {
      // Basic half-width mapping if needed
      return ch;
    });
}

/**
 * Normalizes input: handles kanji/katakana/hiragana formatting, trims
 */
export function normalizeInput(str: string): string {
  return str.trim().replace(/\s+/g, '');
}

/**
 * Checks if the string consists purely of Hiragana or Chōonpu (ー)
 */
export function isAllHiragana(str: string): boolean {
  return /^[\u3041-\u3096ー]+$/.test(str);
}

/**
 * Checks if the string contains Katakana
 */
export function containsKatakana(str: string): boolean {
  return /[\u30a1-\u30f6]/.test(str);
}

/**
 * Checks if word contains 濁点 / 半濁点 (が, ざ, だ, ば, ぱ, etc.)
 */
export function hasDakuonOrHandakuon(str: string): boolean {
  const hira = toHiragana(str);
  // がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゔ
  return /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゔガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴ]/.test(hira);
}

/**
 * Checks if word contains small kana (ゃ, ゅ, ょ, っ, ぁ, ぃ, ぅ, ぇ, ぉ, etc.)
 */
export function hasSmallKana(str: string): boolean {
  const hira = toHiragana(str);
  return /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/.test(hira);
}

/**
 * Normalizes small kana to normal kana (e.g. ゃ -> や)
 */
export function normalizeSmallKana(char: string): string {
  const map: Record<string, string> = {
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ',
    'ァ': 'あ', 'ィ': 'い', 'ゥ': 'う', 'ェ': 'え', 'ォ': 'お',
    'ッ': 'つ', 'ャ': 'や', 'ュ': 'ゆ', 'ョ': 'よ', 'ヮ': 'わ',
  };
  return map[char] || char;
}

/**
 * Extracts the starting character of a word (normalized to Hiragana)
 */
export function getFirstChar(str: string): string {
  const hira = toHiragana(normalizeInput(str));
  if (!hira) return '';
  return hira.charAt(0);
}

/**
 * Extracts the next required character from the end of the word
 * Handles:
 * - 'ー' (long vowel): takes previous kana (e.g. タクシー -> し, ルビー -> び)
 * - small kana (ゃ, ゅ, ょ, etc.): normalized to regular kana (e.g. かいしゃ -> や)
 */
export function getNextRequiredChar(str: string): string {
  const hira = toHiragana(normalizeInput(str));
  if (!hira) return '';

  let len = hira.length;
  let lastChar = hira.charAt(len - 1);

  // If ending with chōonpu 'ー'
  if (lastChar === 'ー') {
    if (len >= 2) {
      lastChar = hira.charAt(len - 2);
    }
  }

  // Normalize small kana to standard kana
  return normalizeSmallKana(lastChar);
}

/**
 * Calculates character length for Shiritori
 */
export function getCharCount(str: string): number {
  return normalizeInput(str).length;
}

/**
 * Comprehensive Shiritori Validator
 */
export function validateShiritoriWord(
  rawInput: string,
  requiredChar: string,
  history: WordEntry[],
  rules: GameRuleConfig,
  currentTurn: number
): ValidationResult {
  const trimmed = normalizeInput(rawInput);
  if (!trimmed) {
    return {
      valid: false,
      isGameOver: false,
      reason: '入力してください',
    };
  }

  const hira = toHiragana(trimmed);
  const firstChar = hira.charAt(0);
  const lastChar = hira.charAt(hira.length - 1);

  // 1. Check if ends with 'ん' -> GAME OVER!
  if (lastChar === 'ん' || trimmed.endsWith('ン')) {
    return {
      valid: false,
      isGameOver: true,
      cause: 'ended_with_n',
      reason: `「${trimmed}」の「ん」で終了`,
    };
  }

  // 2. Initial Character Match (unless free start / first turn)
  if (requiredChar) {
    const normRequired = toHiragana(requiredChar);
    const normFirst = normalizeSmallKana(firstChar);

    if (normFirst !== normRequired && firstChar !== normRequired) {
      return {
        valid: false,
        isGameOver: false,
        cause: 'invalid_start',
        reason: `「${requiredChar}」から始まっていません`,
      };
    }
  }

  // 3. Already Used Word Check
  const alreadyUsed = history.some(
    (entry) =>
      entry.word === trimmed ||
      toHiragana(entry.word) === hira ||
      entry.hiragana === hira
  );
  if (alreadyUsed) {
    return {
      valid: false,
      isGameOver: false,
      cause: 'already_used',
      reason: 'すでに使用済みです',
    };
  }

  // 4. Character count rules
  const charLength = trimmed.length;

  // A. ① 文字数を指定
  if (rules.charCountMode === 'fixed') {
    if (charLength !== rules.fixedCount) {
      return {
        valid: false,
        isGameOver: false,
        cause: 'rule_violation',
        reason: `${rules.fixedCount}文字が必要です (${charLength}文字)`,
      };
    }
  } else if (rules.charCountMode === 'range') {
    if (rules.rangeNoUpperLimit) {
      if (charLength < rules.minCount) {
        return {
          valid: false,
          isGameOver: false,
          cause: 'rule_violation',
          reason: `${rules.minCount}文字以上が必要です (${charLength}文字)`,
        };
      }
    } else {
      if (charLength < rules.minCount || charLength > rules.maxCount) {
        return {
          valid: false,
          isGameOver: false,
          cause: 'rule_violation',
          reason: `${rules.minCount}〜${rules.maxCount}文字が必要です (${charLength}文字)`,
        };
      }
    }
  }

  // A. ② 前の言葉と同じ文字数禁止
  if (rules.noSameLengthAsPrev && history.length > 0) {
    const prevEntry = history[history.length - 1];
    if (charLength === prevEntry.charCount) {
      return {
        valid: false,
        isGameOver: false,
        cause: 'rule_violation',
        reason: `直前と同じ${charLength}文字は禁止です`,
      };
    }
  }

  // A. ③ 文字数を1文字ずつ増やす
  if (rules.incrementalLength || rules.progressiveLengthIncrease) {
    const startCount = rules.incrementalStartCount || 3;
    const requiredLength = startCount + (currentTurn - 1);
    if (charLength !== requiredLength) {
      return {
        valid: false,
        isGameOver: false,
        cause: 'rule_violation',
        reason: `${requiredLength}文字が必要です (${charLength}文字)`,
      };
    }
  }

  // C. 言葉の種類縛り
  // カタカナ禁止
  if (rules.noKatakana && containsKatakana(trimmed)) {
    return {
      valid: false,
      isGameOver: false,
      cause: 'rule_violation',
      reason: 'カタカナ禁止です',
    };
  }

  // ひらがなだけ
  if (rules.onlyHiragana && !isAllHiragana(trimmed)) {
    return {
      valid: false,
      isGameOver: false,
      cause: 'rule_violation',
      reason: 'ひらがなのみ入力可能です',
    };
  }

  // E. 頭文字縛り
  // ① 使った頭文字禁止
  if (rules.noReusedInitial && history.length > 0) {
    const usedInitials = new Set(
      history.map((e) => toHiragana(e.word).charAt(0))
    );
    if (usedInitials.has(firstChar)) {
      return {
        valid: false,
        isGameOver: false,
        cause: 'rule_violation',
        reason: `頭文字「${firstChar}」は使用済みです`,
      };
    }
  }

  // ② 特定の文字禁止 (Forbidden starting letters)
  if (rules.forbiddenLetters && rules.forbiddenLetters.length > 0) {
    const forbiddenNormalized = rules.forbiddenLetters.map((l) => toHiragana(l.trim()));
    if (forbiddenNormalized.includes(firstChar)) {
      return {
        valid: false,
        isGameOver: false,
        cause: 'rule_violation',
        reason: `頭文字「${firstChar}」は禁止です`,
      };
    }
  }

  // F. 文字に関する縛り
  // 濁点・半濁点禁止
  if (rules.noDakuonHandakuon && hasDakuonOrHandakuon(trimmed)) {
    return {
      valid: false,
      isGameOver: false,
      cause: 'rule_violation',
      reason: '濁点・半濁点は禁止です',
    };
  }

  // 小文字禁止
  if (rules.noSmallKana && hasSmallKana(trimmed)) {
    return {
      valid: false,
      isGameOver: false,
      cause: 'rule_violation',
      reason: '小文字は禁止です',
    };
  }

  // 特定の文字を含む言葉禁止
  if (rules.forbiddenContains && rules.forbiddenContains.length > 0) {
    for (const fc of rules.forbiddenContains) {
      const normFc = toHiragana(fc.trim());
      if (normFc && hira.includes(normFc)) {
        return {
          valid: false,
          isGameOver: false,
          cause: 'rule_violation',
          reason: `「${fc}」は禁止文字です`,
        };
      }
    }
  }

  // G. 共通文字ルール
  if (history.length > 0) {
    const prevEntry = history[history.length - 1];
    const prevHira = toHiragana(prevEntry.word);

    // ① 前の言葉と同じ文字を含める
    if (rules.mustIncludePrevChar) {
      const prevChars = new Set(prevHira.split(''));
      const currentChars = hira.split('');
      const sharedChars = currentChars.filter((c, idx) => {
        if (idx === 0) return false;
        return prevChars.has(c);
      });

      if (sharedChars.length === 0) {
        return {
          valid: false,
          isGameOver: false,
          cause: 'rule_violation',
          reason: `前の言葉の文字を1文字以上含めてください`,
        };
      }
    }

    // ② 前の言葉と同じ文字を使わない
    if (rules.noCommonCharExceptLink) {
      const prevChars = new Set(prevHira.split(''));
      const currentChars = hira.split('');
      const prohibitedShared = currentChars.filter((c, idx) => {
        if (idx === 0) return false;
        return prevChars.has(c);
      });

      if (prohibitedShared.length > 0) {
        return {
          valid: false,
          isGameOver: false,
          cause: 'rule_violation',
          reason: `前の言葉の文字「${prohibitedShared.join(', ')}」は重複禁止です`,
        };
      }
    }
  }

  return {
    valid: true,
    isGameOver: false,
  };
}
