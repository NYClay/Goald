import { Bear, Timestamp } from '../types';

const mockTimestamp: Timestamp = {
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
} as const;

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
    furniture: ['bed', 'rug', 'lamp'],
    theme: 'cozy' as const,
    createdAt: mockTimestamp,
  },
  {
    id: 'cave_2',
    userId: 'e2e-user',
    name: 'Japan Trip',
    targetAmount: 500000,
    currentAmount: 125000,
    furniture: ['mat', 'desk', 'monitor'],
    theme: 'modern' as const,
    createdAt: mockTimestamp,
  },
];

const mockMissions = [
  {
    id: 'mission_2024-01-15',
    type: 'save_amount' as const,
    target: 500,
    completed: false,
    xpReward: 50,
    date: '2024-01-15',
  },
];

const mockStreak = {
  current: 5,
  longest: 12,
  lastMissionDate: '2024-01-14',
  fireLevel: 2,
};

export const e2eUser = { uid: 'e2e-user', email: 'e2e@goald.local' };

export function e2eCreateBear(bear: { id: string }) {
  return bear.id;
}

export function e2eGetBear(bearId: string) {
  return mockBear;
}

export function e2eUpdateBear(bearId: string, updates: Record<string, unknown>) {
  Object.assign(mockBear, updates);
  return Promise.resolve();
}

export function e2eFeedBear(bearId: string, amountCents: number) {
  const xpEarned = Math.floor(amountCents / 100);
  mockBear.xp += xpEarned;
  mockBear.level = Math.min(10, mockBear.level + (xpEarned > 500 ? 1 : 0));
  mockBear.mood = 'ecstatic';
  return Promise.resolve({
    newXp: mockBear.xp,
    newLevel: mockBear.level,
    leveledUp: false,
    newAccessories: [],
    mood: 'ecstatic',
  });
}

export function e2eCreateCave(caveId: string, cave: Record<string, unknown>) {
  return Promise.resolve(caveId);
}

export function e2eGetCave(caveId: string) {
  return mockCaves.find((c) => c.id === caveId) || null;
}

export function e2eGetCaves(userId: string) {
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

export function e2eCompleteMission(userId: string, mission: Record<string, unknown>) {
  mission.completed = true;
  return Promise.resolve({
    missionId: mission.id,
    xpEarned: mission.xpReward,
    streak: mockStreak,
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

export const e2eUser = { uid: 'e2e-user', email: 'e2e@goald.local' };
