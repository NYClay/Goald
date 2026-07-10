import {
  updateDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, assertFirebaseConfigured } from './firebase';
import { isE2EMode } from '../config/runtime';
import { e2eServices } from './e2eStore';
import { Bear, FeedResult, AccessoryId, Mood, ACCESSORY_UNLOCKS } from '../types';

const BEAR_XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export async function createBear(userId: string, name: string): Promise<string> {
  if (isE2EMode) return e2eServices.bear.createBear(userId, name);
  assertFirebaseConfigured();

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

  await setDoc(doc(db!, 'bears', bearId), { ...bear, id: bearId });
  return bearId;
}

export async function getBear(bearId: string): Promise<Bear | null> {
  if (isE2EMode) return e2eServices.bear.getBear(bearId);
  assertFirebaseConfigured();

  const snap = await getDoc(doc(db!, 'bears', bearId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bear;
}

export function subscribeBear(bearId: string, cb: (bear: Bear | null) => void): () => void {
  if (isE2EMode) return () => {};
  assertFirebaseConfigured();

  const unsub = onSnapshot(doc(db!, 'bears', bearId), snap => {
    if (snap.exists()) {
      cb({ id: snap.id, ...snap.data() } as Bear);
    } else {
      cb(null);
    }
  });
  return unsub;
}

export async function feedBear(bearId: string, amountCents: number): Promise<FeedResult> {
  if (isE2EMode) return e2eServices.bear.feedBear(bearId, amountCents);
  assertFirebaseConfigured();

  const bearRef = doc(db!, 'bears', bearId);
  const snap = await getDoc(bearRef);
  if (!snap.exists()) throw new Error('Bear not found');

  const bear = snap.data() as Bear;
  const xpEarned = Math.floor(amountCents / 100);
  const newXp = bear.xp + xpEarned;
  const newLevel = Math.min(10, BEAR_XP_PER_LEVEL.findIndex(xp => xp >= newXp) + 1 || 1);

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
