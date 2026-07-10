import {
  Bear,
  Streak,
  DailyMission,
  MissionResult,
  FurnitureId,
  CaveTheme,
  BadgeId,
} from '../types';
import { Timestamp } from 'firebase/firestore';

const now = Date.now();
const mockTimestamp = {
  toDate: () => new Date(now),
  toMillis: () => now,
  seconds: Math.floor(now / 1000),
  nanoseconds: 0,
  isEqual: (other: Timestamp) =>
    other.seconds === Math.floor(now / 1000) && other.nanoseconds === 0,
  toJSON: () => ({ seconds: Math.floor(now / 1000), nanoseconds: 0, type: 'timestamp' }),
} as Timestamp;

const mockBear: Bear = {
  id: 'bear_e2e',
  userId: 'e2e-user',
  name: 'Honey',
  level: 3,
  xp: 200,
  size: 'cub',
  accessories: ['scarf'],
  mood: 'happy',
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

const mockCaves = [
  {
    id: 'cave_1',
    userId: 'e2e-user',
    name: 'Emergency Fund',
    targetAmount: 1000000,
    currentAmount: 320000,
    furniture: ['bed', 'rug', 'lamp'] as FurnitureId[],
    theme: 'cozy' as CaveTheme,
    createdAt: mockTimestamp,
  },
  {
    id: 'cave_2',
    userId: 'e2e-user',
    name: 'Japan Trip',
    targetAmount: 500000,
    currentAmount: 125000,
    furniture: ['mat', 'desk', 'monitor'] as FurnitureId[],
    theme: 'modern' as CaveTheme,
    createdAt: mockTimestamp,
  },
];

const mockMissions: DailyMission[] = [
  {
    id: 'mission_2024-01-15',
    userId: 'e2e-user',
    type: 'save_amount',
    target: 500,
    completed: false,
    xpReward: 50,
    date: '2024-01-15',
  },
];

const mockStreak: Streak = {
  userId: 'e2e-user',
  current: 5,
  longest: 12,
  lastMissionDate: '2024-01-14',
  fireLevel: 2,
};

export const e2eUser = { uid: 'e2e-user', email: 'e2e@goald.local' };

export function e2eCreateBear(bear: { id: string; userId: string; name: string }) {
  return bear.id;
}

export function e2eGetBear(_bearId: string) {
  return mockBear;
}

export function e2eUpdateBear(_bearId: string, updates: Record<string, unknown>) {
  Object.assign(mockBear, updates);
  return Promise.resolve();
}

export function e2eFeedBear(_bearId: string, amountCents: number) {
  const xpEarned = Math.floor(amountCents / 100);
  mockBear.xp += xpEarned;
  mockBear.level = Math.min(10, mockBear.level + (xpEarned > 500 ? 1 : 0));
  mockBear.mood = 'ecstatic';
  return Promise.resolve({
    newXp: mockBear.xp,
    newLevel: mockBear.level,
    leveledUp: false,
    newAccessories: [],
    mood: 'ecstatic' as const,
  });
}

export function e2eGetBearDisplayData(_bearId: string) {
  return {
    size: mockBear.size,
    level: mockBear.level,
    xpProgress: 0.5,
    xpToNext: 100,
    accessories: mockBear.accessories,
    mood: mockBear.mood,
  };
}

export function e2eCreateCave(caveId: string, _cave: Record<string, unknown>) {
  return Promise.resolve(caveId);
}

export function e2eGetCave(caveId: string) {
  return mockCaves.find((c) => c.id === caveId) || null;
}

export function e2eGetCaves(_userId: string) {
  return Promise.resolve(mockCaves);
}

export function e2eDepositToCave(caveId: string, amountCents: number) {
  const cave = mockCaves.find((c) => c.id === caveId);
  if (cave) {
    cave.currentAmount += amountCents;
    return Promise.resolve({ caveId, newFurniture: [], completed: false });
  }
  return Promise.resolve({ caveId, newFurniture: [], completed: false });
}

export function e2eGetMissions() {
  return mockMissions;
}

export function e2eGetOrCreateStreak(_userId: string) {
  return Promise.resolve(mockStreak);
}

export function e2eGetTodaysMission(_userId: string, _bearLevel: number) {
  return Promise.resolve(mockMissions[0]);
}

export function e2eCompleteMission(_userId: string, mission: Record<string, unknown>) {
  mission.completed = true;
  return Promise.resolve({
    missionId: mission.id as string,
    xpEarned: mission.xpReward as number,
    newStreak: mockStreak.current,
    fireLevel: mockStreak.fireLevel,
    badgesEarned: [] as BadgeId[],
    leveledUp: false,
  });
}

export function e2eGetStreak() {
  return mockStreak;
}

export function e2eAuthLogin() {}
export function e2eAuthLogout() {}
export function e2eAuthSubscribe(cb: (user: { uid: string; email: string }) => void) {
  cb(e2eUser);
  return () => {};
}
