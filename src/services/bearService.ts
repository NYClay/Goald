import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { isE2EMode } from '../config/runtime';
import {
  e2eCreateBear,
  e2eGetBear,
  e2eUpdateBear,
  e2eFeedBear,
  e2eGetBearDisplayData,
} from './e2eStore';
import { Bear, FeedResult, getBearDisplayData } from '../types';

const BEAR_XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const ACCESSORY_UNLOCKS: Record<number, string[]> = {
  2: ['scarf'],
  3: ['glasses'],
  4: ['party_hat'],
  6: ['sunglasses'],
  7: ['backpack'],
  8: ['crown'],
  9: [],
  10: [],
};

export async function createBear(userId: string, name: string): Promise<string> {
  if (isE2EMode) return e2eCreateBear({ userId, name });

  const bearId = `bear_${userId}`;
  const bear: Omit<Bear, 'id'> = {
    userId,
    name,
    level: 1,
    xp: 0,
    size: 'cub',
    accessories: [],
    mood: 'hungry',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'bears'), { ...bear, id: bearId });
  return bearId;
}

export async function getBear(bearId: string): Promise<Bear | null> {
  if (isE2EMode) return e2eGetBear(bearId);

  const snap = await getDoc(doc(db, 'bears', bearId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bear;
}

export function subscribeBear(bearId: string, cb: (bear: Bear | null) => void): () => void {
  if (isE2EMode) return () => {};

  const unsub = onSnapshot(doc(db, 'bears', bearId), (snap) => {
    if (snap.exists()) {
      cb({ id: snap.id, ...snap.data() } as Bear);
    } else {
      cb(null);
    }
  });
  return unsub;
}

export async function feedBear(bearId: string, amountCents: number): Promise<FeedResult> {
  if (isE2EMode) return e2eFeedBear(bearId, amountCents);

  const bearRef = doc(db, 'bears', bearId);
  const snap = await getDoc(bearRef);
  if (!snap.exists()) throw new Error('Bear not found');

  const bear = snap.data() as Bear;
  const xpEarned = Math.floor(amountCents / 100);
  const newXp = bear.xp + xpEarned;
  const newLevel = Math.min(10, BEAR_XP_PER_LEVEL.findIndex((xp) => xp >= newXp) + 1 || 1);

  const leveledUp = newLevel > bear.level;
  const newAccessories: string[] = [];
  const oldLevel = bear.level;

  for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
    const unlocks = ACCESSORY_UNLOCKS[lvl] || [];
    newAccessories.push(...unlocks);
  }

  const mood = xpEarned > 200 ? 'ecstatic' : xpEarned > 100 ? 'happy' : 'content';

  await updateDoc(bearRef, {
    xp: newXp,
    level: newLevel,
    accessories: [...bear.accessories, ...newAccessories],
    mood,
    updatedAt: serverTimestamp(),
  });

  return {
    newXp,
    newLevel,
    leveledUp,
    newAccessories,
    mood,
  };
}

export async function renameBear(bearId: string, name: string): Promise<void> {
  if (isE2EMode) return;
  await updateDoc(doc(db, 'bears', bearId), { name, updatedAt: serverTimestamp() });
}

export function getBearSize(level: number): 'cub' | 'grown' | 'giant' {
  if (level <= 3) return 'cub';
  if (level <= 7) return 'grown';
  return 'giant';
}

export function getXpForNextLevel(level: number): number {
  if (level >= 10) return BEAR_XP_PER_LEVEL[9];
  return BEAR_XP_PER_LEVEL[level];
}

export function getXpProgress(level: number, xp: number): number {
  if (level >= 10) return 1;
  const currentThreshold = BEAR_XP_PER_LEVEL[level - 1];
  const nextThreshold = BEAR_XP_PER_LEVEL[level];
  return Math.min((xp - currentThreshold) / (nextThreshold - currentThreshold), 1);
}

export function getAvailableAccessories(bear: Bear): string[] {
  const unlocked = new Set(bear.accessories);
  const available: string[] = [];

  for (let lvl = 1; lvl <= bear.level; lvl++) {
    (ACCESSORY_UNLOCKS[lvl] || []).forEach((a) => {
      if (!unlocked.has(a)) available.push(a);
    });
  }

  return available;
}

export function calculateMood(bear: Bear): Bear['mood'] {
  const hoursSinceFeed = bear.lastFedAt ? (Date.now() - bear.lastFedAt.toMillis()) / 36e5 : 999;

  if (bear.xp === 0 && bear.level === 1) return 'hungry';
  if (hoursSinceFeed < 12) return 'ecstatic';
  if (hoursSinceFeed < 24) return 'happy';
  if (hoursSinceFeed < 48) return 'content';
  return 'hungry';
}

export function getBearDisplayData(bear: Bear) {
  return getBearDisplayData(bear);
}
