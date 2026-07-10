import { Timestamp } from 'firebase/firestore';

export type Size = 'cub' | 'grown' | 'giant';
export type Mood = 'hungry' | 'content' | 'happy' | 'ecstatic';
export type CaveTheme = 'cozy' | 'modern' | 'rustic' | 'spa';
export type MissionType = 'save_amount' | 'round_up' | 'skip_purchase' | 'custom';

export type AccessoryId = 'party_hat' | 'scarf' | 'glasses' | 'crown' | 'backpack' | 'sunglasses';

export type FurnitureId =
  | 'bed'
  | 'rug'
  | 'lamp'
  | 'tv'
  | 'sofa'
  | 'spa'
  | 'fireplace'
  | 'garden'
  | 'mat'
  | 'desk'
  | 'monitor'
  | 'chair'
  | 'couch'
  | 'plant'
  | 'balcony'
  | 'pallet'
  | 'blanket'
  | 'lantern'
  | 'table'
  | 'bench'
  | 'stove'
  | 'herbs'
  | 'porch'
  | 'towel'
  | 'candle'
  | 'robe'
  | 'tub'
  | 'sauna'
  | 'stones'
  | 'zen_garden'
  | 'bookshelf'
  | 'cat';

export type BadgeId =
  | 'first_deposit'
  | 'halfway'
  | 'completed'
  | 'streak_3'
  | 'streak_6'
  | 'multi_goal'
  | 'first_feed'
  | 'week_streak'
  | 'furnished_cave'
  | 'level_5'
  | 'honey_hoarder'
  | 'cave_master'
  | 'iron_gut'
  | 'bear_whisperer'
  | 'giant_bear'
  | 'mission_master'
  | 'completionist'
  | 'early_bird';

export { Timestamp };

export interface Bear {
  id: string;
  userId: string;
  name: string;
  level: number;
  xp: number;
  size: Size;
  accessories: AccessoryId[];
  mood: Mood;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Cave {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  furniture: FurnitureId[];
  theme: CaveTheme;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface DailyMission {
  id: string;
  userId: string;
  type: MissionType;
  target: number;
  completed: boolean;
  xpReward: number;
  date: string;
  completedAt?: string;
}

export interface Streak {
  userId: string;
  current: number;
  longest: number;
  lastMissionDate: string;
  fireLevel: 0 | 1 | 2 | 3;
}

export interface UserStats {
  currentStreak: number;
  lastDepositMonth: string;
  badges: BadgeId[];
  totalDeposits: number;
}

export interface FeedResult {
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  newAccessories: AccessoryId[];
  mood: Mood;
}

export interface CaveProgress {
  caveId: string;
  newFurniture: FurnitureId[];
  completed: boolean;
}

export interface MissionResult {
  xpEarned: number;
  newStreak: number;
  fireLevel: 0 | 1 | 2 | 3;
  badgesEarned: BadgeId[];
}

export const ACCESSORY_UNLOCKS: Record<number, AccessoryId[]> = {
  1: [],
  2: ['scarf'],
  3: ['glasses'],
  4: ['party_hat'],
  5: [],
  6: ['sunglasses'],
  7: ['backpack'],
  8: ['crown'],
  9: [],
  10: [],
};

export const LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1400,
  8: 1900,
  9: 2500,
  10: 3200,
};

export const MISSION_XP: Record<MissionType, number> = {
  save_amount: 50,
  round_up: 30,
  skip_purchase: 40,
  custom: 60,
};

export const CAVE_FURNITURE: Record<CaveTheme, FurnitureId[]> = {
  cozy: ['bed', 'rug', 'lamp', 'bookshelf', 'sofa', 'fireplace', 'cat', 'garden'],
  modern: ['mat', 'desk', 'monitor', 'chair', 'couch', 'tv', 'plant', 'balcony'],
  rustic: ['pallet', 'blanket', 'lantern', 'table', 'bench', 'stove', 'herbs', 'porch'],
  spa: ['towel', 'mat', 'candle', 'robe', 'tub', 'sauna', 'stones', 'zen_garden'],
};
