import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
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
import { Bear, FeedResult, AccessoryId, Mood, ACCESSORY_UNLOCKS } from '../types';
import { getBearDisplayData } from '../types';

const BEAR_XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export async function createBear(userId: string, name: string): Promise<string> {
  if (isE2EMode) return e2eCreateBear({ id: `bear_${userId}`, userId, name });

  const bearId = `bear_${userId}`;
  const bear: Omit<Bear, 'id'> = {
    userId,
    name,
    level: 1,
    xp: 0,
    size: 'cub',
    accessories: [],
    mood: 'hungry',
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await addDoc(collection(db!, 'bears'), { ...bear, id: bearId });
  return bearId;
}

export async function getBear(bearId: string): Promise<Bear | null> {
  if (isE2EMode) return e2eGetBear(bearId);

  const snap = await getDoc(doc(db!, 'bears', bearId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bear;
}

export function subscribeBear(bearId: string, cb: (bear: Bear | null) => void): () => void {
  if (isE2EMode) return () => {};

  const unsub = onSnapshot(doc(db!, 'bears', bearId), (snap) => {
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

  const bearRef = doc(db!, 'bears', bearId);
  const snap = await getDoc(bearRef);
  if (!snap.exists()) throw new Error('Bear not found');

  const bear = snap.data() as Bear;
  const xpEarned = Math.floor(amountCents / 100);
  const newXp = bear.xp + xpEarned;
  const newLevel = Math.min(10, BEAR_XP_PER_LEVEL.findIndex((xp) => xp >= newXp) + 1 || 1);

  const leveledUp = newLevel > bear.level;
  const newAccessories: AccessoryId[] = [];
  const oldLevel = bear.level;

  for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
    const unlocks = ACCESSORY_UNLOCKS[lvl] || [];
    newAccessories.push(...unlocks);
  }

  const mood: Mood = xpEarned > 200 ? 'ecstatic' : xpEarned > 100 ? 'happy' : 'content';

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
  await updateDoc(doc(db!, 'bears', bearId), { name, updatedAt: serverTimestamp() });
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

export function getAvailableAccessories(bear: Bear): AccessoryId[] {
  const unlocked = new Set(bear.accessories);
  const available: AccessoryId[] = [];

  for (let lvl = 1; lvl <= bear.level; lvl++) {
    (ACCESSORY_UNLOCKS[lvl] || []).forEach((a) => {
      if (!unlocked.has(a)) available.push(a);
    });
  }

  return available;
}

export function calculateMood(bear: Bear): Bear['mood'] {
  const lastFedAt = bear.updatedAt?.toMillis?.() ?? Date.now();
  const hoursSinceFeed = (Date.now() - lastFedAt) / 36e5;

  if (bear.xp === 0 && bear.level === 1) return 'hungry';
  if (hoursSinceFeed < 12) return 'ecstatic';
  if (hoursSinceFeed < 24) return 'happy';
  if (hoursSinceFeed < 48) return 'content';
  return 'hungry';
}

export function getBearDisplayDataFromBear(bear: Bear) {
  return getBearDisplayData(bear);
}
