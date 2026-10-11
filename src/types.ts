export type PlayerMode = 'solo' | 'duo' | 'group';

export interface GameRuleConfig {
  // A. 文字数ルール
  charCountMode: 'none' | 'fixed' | 'range';
  fixedCount: number; // 2, 3, 4, 5, 6
  minCount: number;
  maxCount: number;
  rangeNoUpperLimit?: boolean; // ◯文字以上（上限なし）
  noSameLengthAsPrev: boolean; // 前の言葉と同じ文字数禁止
  incrementalLength: boolean; // 文字数を1文字ずつ増やす
  incrementalStartCount: number; // 開始文字数: 2, 3, 4

  // B. ジャンル縛り
  genreEnabled: boolean;
  selectedGenres: string[];

  // C. 言葉の種類縛り
  noKatakana: boolean; // カタカナ禁止
  kanjiExpressible: boolean; // 漢字で表せる言葉限定
  onlyHiragana: boolean; // ひらがなだけ
  properNounOnly: boolean; // 固有名詞限定
  tangibleOnly: boolean; // 実物があるもの限定
  noAbstract: boolean; // 抽象的な言葉禁止

  // D. 「○○なもの」縛り (自由テーマ)
  themeEnabled: boolean;
  themeText: string;

  // E. 頭文字縛り・クリア
  noReusedInitial: boolean; // 使った頭文字禁止
  forbiddenLetters: string[]; // 特定の文字禁止
  targetInitialsEnabled: boolean; // 特定の頭文字をクリアする
  targetInitials: string[]; // クリア対象の頭文字リスト (例: ['あ', 'さ', 'た'])

  // F. 文字に関する縛り
  noDakuonHandakuon: boolean; // 濁点・半濁点禁止
  noSmallKana: boolean; // 小文字禁止 (ゃ・ゅ・ょ・っ等)
  forbiddenContains: string[]; // 特定の文字を含む言葉禁止

  // G. 共通文字ルール
  mustIncludePrevChar: boolean; // 前の言葉と同じ文字を含める
  noCommonCharExceptLink: boolean; // 前の言葉と同じ文字を使わない（頭文字以外）

  // H. 制限時間（全体のゲームプレイ時間）
  timerEnabled: boolean;
  timerMinutes: number; // 任意の分数 (例: 1, 2, 3, 5, 10...)
  timerSeconds?: number; // 後方互換用（秒単位）

  // I. 文字数増加モード
  progressiveLengthIncrease: boolean; // 文字数を増やす (3 -> 4 -> 5...)

  // J. 目標語数（全体での目標語数）
  targetWordCountEnabled: boolean;
  targetWordCount: number; // 全体で目指す語数 (例: 10, 20, 30, 50...)

  // プレイヤー設定
  playerMode: PlayerMode;
  groupCount: number;
  playerNames: string[];
}

export interface PlayerInfo {
  id: number;
  name: string;
  color: string;
  iconBg: string;
  badgeBg: string;
  textColor: string;
}

export interface WordEntry {
  id: string;
  word: string;
  hiragana: string;
  playerIndex: number;
  turn: number;
  charCount: number;
  timestamp: number;
}

export interface ValidationResult {
  valid: boolean;
  isGameOver: boolean;
  reason?: string;
  cause?: 'ended_with_n' | 'timeout' | 'rule_violation' | 'already_used' | 'invalid_start';
}

export interface GameState {
  phase: 'start' | 'playing' | 'gameover';
  currentTurn: number;
  activePlayerIndex: number;
  requiredChar: string;
  history: WordEntry[];
  timeLeft: number;
  gameOverReason: {
    lastWord?: string;
    cause: 'ended_with_n' | 'timeout' | 'surrender' | 'target_reached' | 'initials_cleared';
    message: string;
  } | null;
  usedInitials: Set<string>;
  usedWords: Set<string>;
}
