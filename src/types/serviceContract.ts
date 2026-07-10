import { Bear, Cave, DailyMission, Streak, MissionResult, FurnitureId } from './index';

/**
 * Shared service contract that both real Firestore services and the E2E
 * in-memory store must implement. This guarantees behavioral parity
 * between unit/E2E tests and production.
 */
export interface BearServiceContract {
  createBear(userId: string, name: string): Promise<string>;
  getBear(bearId: string): Promise<Bear | null>;
  feedBear(
    bearId: string,
    amountCents: number
  ): Promise<{
    newXp: number;
    newLevel: number;
    leveledUp: boolean;
    newAccessories: Bear['accessories'];
    mood: Bear['mood'];
  }>;
  subscribeBear(bearId: string, cb: (bear: Bear | null) => void): () => void;
}

export interface CaveServiceContract {
  createCave(
    userId: string,
    data: Omit<Cave, 'id' | 'userId' | 'createdAt' | 'furniture' | 'currentAmount'>
  ): Promise<string>;
  getCave(caveId: string): Promise<Cave | null>;
  getUserCaves(userId: string): Promise<Cave[]>;
  depositToCave(
    caveId: string,
    amountCents: number
  ): Promise<{ caveId: string; newFurniture: FurnitureId[]; completed: boolean }>;
  subscribeUserCaves(userId: string, cb: (caves: Cave[]) => void): () => void;
}

export interface MissionServiceContract {
  getOrCreateStreak(userId: string): Promise<Streak>;
  getTodaysMission(userId: string, bearLevel: number): Promise<DailyMission | null>;
  completeMission(userId: string, mission: DailyMission): Promise<MissionResult>;
}

export interface AuthServiceContract {
  register(email: string, password: string): Promise<{ uid: string; email: string | null }>;
  login(email: string, password: string): Promise<{ uid: string; email: string | null }>;
  logout(): Promise<void>;
  onAuthChanged(cb: (user: { uid: string; email: string | null } | null) => void): () => void;
}

export interface ServiceContract {
  bear: BearServiceContract;
  cave: CaveServiceContract;
  mission: MissionServiceContract;
  auth: AuthServiceContract;
}
