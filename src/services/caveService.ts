import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { isE2EMode } from '../config/runtime';
import { Cave, CAVE_FURNITURE, CaveTheme } from '../types';
import { e2eCreateCave, e2eGetCave, e2eGetCaves, e2eDepositToCave } from './e2eStore';

export async function createCave(
  userId: string,
  data: Omit<Cave, 'id' | 'userId' | 'createdAt' | 'furniture' | 'currentAmount'>
): Promise<string> {
  const caveId = `cave_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const cave: Omit<Cave, 'id'> = {
    ...data,
    userId,
    currentAmount: 0,
    furniture: [],
    createdAt: serverTimestamp(),
  };

  if (isE2EMode) return e2eCreateCave(caveId, cave);

  await setDoc(doc(db, 'caves', caveId), cave);
  return caveId;
}

export async function getCave(caveId: string): Promise<Cave | null> {
  if (isE2EMode) return e2eGetCave(caveId);

  const snap = await getDoc(doc(db, 'caves', caveId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Cave;
}

export async function getUserCaves(userId: string): Promise<Cave[]> {
  if (isE2EMode) return e2eGetCaves(userId);

  const q = query(collection(db, 'caves'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cave);
}

export function subscribeUserCaves(userId: string, cb: (caves: Cave[]) => void): () => void {
  if (isE2EMode) {
    cb([]); // E2E handled differently
    return () => {};
  }
  const q = query(collection(db, 'caves'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cave));
  });
}

export async function depositToCave(
  caveId: string,
  amountCents: number
): Promise<{ caveId: string; newFurniture: string[]; completed: boolean }> {
  if (isE2EMode) return e2eDepositToCave(caveId, amountCents);

  const ref = doc(db, 'caves', caveId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Cave not found');

  const cave = snap.data() as Cave;
  const newAmount = cave.currentAmount + amountCents;
  const progress = cave.targetAmount > 0 ? newAmount / cave.targetAmount : 0;
  const completed = newAmount >= cave.targetAmount && !cave.completedAt;

  const furniture = CAVE_FURNITURE[cave.theme];
  const newFurniture: string[] = [];
  const newCount = Math.min(furniture.length, Math.floor(progress * furniture.length));
  for (let i = cave.furniture.length; i < newCount; i++) {
    newFurniture.push(furniture[i]);
  }

  await updateDoc(ref, {
    currentAmount: newAmount,
    furniture: [...cave.furniture, ...newFurniture],
    ...(completed ? { completedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });

  return { caveId, newFurniture, completed };
}

export async function renameCave(caveId: string, name: string): Promise<void> {
  if (isE2EMode) return;
  await updateDoc(doc(db, 'caves', caveId), { name, updatedAt: serverTimestamp() });
}
