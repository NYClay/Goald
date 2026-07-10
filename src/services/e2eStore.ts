import { Bear, Streak, DailyMission, FurnitureId, CaveTheme, BadgeId, Cave } from '../types';
import { ServiceContract } from '../types/serviceContract';
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

const mockCaves: Cave[] = [
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

export const e2eServices: ServiceContract = {
  bear: {
    createBear(userId: string, _name: string) {
      return Promise.resolve(`bear_${userId}`);
    },
    getBear(_bearId: string) {
      return Promise.resolve(mockBear);
    },
    feedBear(_bearId: string, amountCents: number) {
      const xpEarned = Math.floor(amountCents / 100);
      mockBear.xp += xpEarned;
      mockBear.level = Math.min(10, mockBear.level + (xpEarned > 500 ? 1 : 0));
      mockBear.mood = 'ecstatic';
      return Promise.resolve({
        newXp: mockBear.xp,
        newLevel: mockBear.level,
        leveledUp: false,
        newAccessories: [] as Bear['accessories'],
        mood: 'ecstatic' as const,
      });
    },
    subscribeBear(_bearId: string, _cb: (bear: Bear | null) => void) {
      return () => {};
    },
  },

  cave: {
    createCave(
      _userId: string,
      _data: Omit<Cave, 'id' | 'userId' | 'createdAt' | 'furniture' | 'currentAmount'>
    ) {
      const caveId = `cave_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return Promise.resolve(caveId);
    },
    getCave(caveId: string) {
      return Promise.resolve(mockCaves.find(c => c.id === caveId) || null);
    },
    getUserCaves(_userId: string) {
      return Promise.resolve(mockCaves);
    },
    depositToCave(caveId: string, amountCents: number) {
      const cave = mockCaves.find(c => c.id === caveId);
      if (cave) {
        cave.currentAmount += amountCents;
      }
      return Promise.resolve({ caveId, newFurniture: [] as FurnitureId[], completed: false });
    },
    subscribeUserCaves(_userId: string, cb: (caves: Cave[]) => void) {
      cb([]);
      return () => {};
    },
  },

  mission: {
    getOrCreateStreak(_userId: string) {
      return Promise.resolve(mockStreak);
    },
    getTodaysMission(_userId: string, _bearLevel: number) {
      return Promise.resolve(mockMissions[0]);
    },
    completeMission(_userId: string, mission: DailyMission) {
      mission.completed = true;
      return Promise.resolve({
        xpEarned: mission.xpReward,
        newStreak: mockStreak.current,
        fireLevel: mockStreak.fireLevel,
        badgesEarned: [] as BadgeId[],
      });
    },
  },

  auth: {
    register(_email: string, _password: string) {
      return Promise.resolve(e2eUser);
    },
    login(_email: string, _password: string) {
      return Promise.resolve(e2eUser);
    },
    logout() {
      return Promise.resolve();
    },
    onAuthChanged(cb: (user: { uid: string; email: string | null } | null) => void) {
      cb(e2eUser);
      return () => {};
    },
  },
};
