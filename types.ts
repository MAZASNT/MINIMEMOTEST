export enum AppState {
  WELCOME = 'WELCOME',
  ANALYZING = 'ANALYZING', // 分析问题
  SPREAD_SELECTION = 'SPREAD_SELECTION', // 选择牌阵
  SHUFFLING = 'SHUFFLING', // 洗牌
  CUTTING = 'CUTTING', // 切牌
  SELECTING = 'SELECTING', // 选牌
  REVEALING = 'REVEALING', // 开牌
  READING = 'READING' // 解读
}

export interface TarotCard {
  id: number;
  name: string;
  name_cn: string;
  meaningUpright: string;
  meaningReversed: string;
  isReversed: boolean;
  archetype: string;
}

export interface CardPosition {
  id: string;
  name: string; // e.g., "过去", "障碍", "结果"
  description: string;
  x: number; // For visual layout (grid col or absolute x)
  y: number; // For visual layout (grid row or absolute y)
  rotation?: number; // For Celtic cross crossing card
}

export interface SpreadDefinition {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: CardPosition[];
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  question: string;
  spreadName: string;
  cards: { positionName: string; card: TarotCard }[];
  interpretation: string;
  userNotes?: string;
}

export interface DeckTheme {
  id: string;
  name: string;
  backImage?: string; // URL or base64
  backColor?: string; // Fallback css gradient
  frontStyle: 'classic' | 'mystic' | 'illustration';
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
}
