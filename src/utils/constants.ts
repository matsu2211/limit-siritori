import { GameRuleConfig, PlayerInfo } from '../types';

export const GENRE_OPTIONS = [
  { id: 'food', label: '食べ物', icon: '🍎' },
  { id: 'drink', label: '飲み物', icon: '🧃' },
  { id: 'animal', label: '動物', icon: '🐶' },
  { id: 'creature', label: '生き物', icon: '🐞' },
  { id: 'vegetable', label: '野菜', icon: '🥕' },
  { id: 'fruit', label: '果物', icon: '🍓' },
  { id: 'sports', label: 'スポーツ', icon: '⚽' },
  { id: 'play', label: '遊び', icon: '🪁' },
  { id: 'game', label: 'ゲーム', icon: '🎮' },
  { id: 'house', label: '家にあるもの', icon: '🏠' },
  { id: 'stationery', label: '文房具', icon: '✏️' },
  { id: 'appliance', label: '家電', icon: '📺' },
  { id: 'vehicle', label: '乗り物', icon: '🚗' },
  { id: 'building', label: '建物', icon: '🏢' },
  { id: 'place', label: '場所', icon: '🗺️' },
  { id: 'nature', label: '自然', icon: '🌲' },
  { id: 'season', label: '季節', icon: '🌸' },
  { id: 'event', label: '行事', icon: '🏮' },
  { id: 'job', label: '職業', icon: '🧑‍🍳' },
  { id: 'person', label: '人', icon: '👥' },
  { id: 'character', label: 'キャラクター', icon: '⭐' },
  { id: 'anime', label: 'アニメ・漫画', icon: '📖' },
  { id: 'other', label: 'その他', icon: '📦' },
];

export const TIMER_PRESETS_MINUTES = [1, 2, 3, 5, 10];
export const TIMER_PRESETS = TIMER_PRESETS_MINUTES; // alias
export const TARGET_WORD_PRESETS = [10, 20, 30, 50];
export const TARGET_INITIALS_PRESETS = [
  { label: 'あ行 (あ・い・う・え・お)', letters: ['あ', 'い', 'う', 'え', 'お'] },
  { label: 'か行 (か・き・く・け・こ)', letters: ['か', 'き', 'く', 'け', 'こ'] },
  { label: 'さ行 (さ・し・す・せ・そ)', letters: ['さ', 'し', 'す', 'せ', 'そ'] },
  { label: 'あ・か・さ・た・な', letters: ['あ', 'か', 'さ', 'た', 'な'] },
];

export const HIRAGANA_CANDIDATES_FOR_INITIALS = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ',
];

export const DEFAULT_RULES: GameRuleConfig = {
  charCountMode: 'none',
  fixedCount: 3,
  minCount: 3,
  maxCount: 5,
  rangeNoUpperLimit: false,
  noSameLengthAsPrev: false,
  incrementalLength: false,
  incrementalStartCount: 3,

  genreEnabled: false,
  selectedGenres: [],

  noKatakana: false,
  kanjiExpressible: false,
  onlyHiragana: false,
  properNounOnly: false,
  tangibleOnly: false,
  noAbstract: false,

  themeEnabled: false,
  themeText: '',

  noReusedInitial: false,
  forbiddenLetters: [],
  targetInitialsEnabled: false,
  targetInitials: [],

  noDakuonHandakuon: false,
  noSmallKana: false,
  forbiddenContains: [],

  mustIncludePrevChar: false,
  noCommonCharExceptLink: false,

  timerEnabled: false,
  timerMinutes: 3,
  timerSeconds: 180,

  progressiveLengthIncrease: false,

  targetWordCountEnabled: false,
  targetWordCount: 20,

  playerMode: 'duo',
  groupCount: 3,
  playerNames: ['プレイヤー1', 'プレイヤー2', 'プレイヤー3', 'プレイヤー4', 'プレイヤー5', 'プレイヤー6'],
};

export const PLAYER_COLORS: PlayerInfo[] = [
  {
    id: 0,
    name: 'プレイヤー1',
    color: '🔵',
    iconBg: 'bg-blue-500',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    textColor: 'text-blue-600',
  },
  {
    id: 1,
    name: 'プレイヤー2',
    color: '🔴',
    iconBg: 'bg-rose-500',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    textColor: 'text-rose-600',
  },
  {
    id: 2,
    name: 'プレイヤー3',
    color: '🟢',
    iconBg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    textColor: 'text-emerald-600',
  },
  {
    id: 3,
    name: 'プレイヤー4',
    color: '🟡',
    iconBg: 'bg-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    textColor: 'text-amber-600',
  },
  {
    id: 4,
    name: 'プレイヤー5',
    color: '🟣',
    iconBg: 'bg-purple-500',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    textColor: 'text-purple-600',
  },
  {
    id: 5,
    name: 'プレイヤー6',
    color: '🟠',
    iconBg: 'bg-orange-500',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    textColor: 'text-orange-600',
  },
];

export const INITIAL_WORD_CANDIDATES = [
  { word: 'りんご', reading: 'りんご' },
  { word: 'いちご', reading: 'いちご' },
  { word: 'すいか', reading: 'すいか' },
  { word: 'さくら', reading: 'さくら' },
  { word: 'ねこ', reading: 'ねこ' },
  { word: 'いぬ', reading: 'いぬ' },
  { word: 'くるま', reading: 'くるま' },
  { word: 'ひまわり', reading: 'ひまわり' },
  { word: 'たいよう', reading: 'たいよう' },
  { word: 'そら', reading: 'そら' },
  { word: 'ほし', reading: 'ほし' },
  { word: 'うみ', reading: 'うみ' },
  { word: 'やま', reading: 'やま' },
  { word: 'バナナ', reading: 'ばなな' },
  { word: 'トマト', reading: 'とまと' },
];
