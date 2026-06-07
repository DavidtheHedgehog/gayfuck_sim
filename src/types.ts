export interface Stats {
  lust: number;       // 欲望 0-100
  anxiety: number;    // 压力 0-100 (100 = 崩溃)
  euphoria: number;   // 欣快度 0-100 (0 = 抑郁而亡)
  wealth: number;     // 资金 
  health: number;     // 健康 0-100 (0 = 死亡)
}

export interface NPC {
  id: string;
  name: string;
  charm: number;      
  length: number;     
  hardness: number;   
  cutStatus: 'cut' | 'uncut'; 
  tags: string[];     
  relation: number;   
  description?: string;
  sceneDetail?: string;
  riskMultiplier?: number;
}

export interface StoryLog {
  id: string;
  text: string;
  type: 'system' | 'story' | 'choice' | 'warning' | 'effect' | 'npc';
  npcState?: NPC | null;
}

export interface GameState {
  day: number;
  stats: Stats;
  flags: Record<string, any>;
  logs: StoryLog[]; // Now this will only contain currently visible logs
  isGameOver: boolean;
  endingId: string | null;
  infections: string[];
  hasFissure: boolean; // 肛裂状态
  hasPrEP: boolean; // 正在服用PrEP暴露前预防药
  currentEventId: string | null;
  npcs: Record<string, NPC>;
  currentNpcId: string | null;
  playerRole: 'top' | 'bottom' | 'vers' | null;
  playerProfile: {
    charm: number;
    length: number;
    hardness: number;
    fetishes: string[];
  } | null;
  partnerId: string | null; // 交往对象ID
  partnerAffection: number | null; // 感情数值
}

export interface Choice {
  text: string | ((state: GameState) => string);
  effect?: (state: GameState) => Partial<GameState> | void | boolean;
  nextEventId?: string | null; 
  condition?: (state: GameState) => boolean;
}

export interface GameEvent {
  id: string;
  text: string | ((state: GameState) => string);
  choices: Choice[];
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  priority: number;
  condition?: (state: GameState) => boolean;
}
