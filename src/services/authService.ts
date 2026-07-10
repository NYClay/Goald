import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, assertFirebaseConfigured } from './firebase';
import { isE2EMode } from '../config/runtime';
import { e2eServices } from './e2eStore';

export async function register(email: string, password: string): Promise<User> {
  assertFirebaseConfigured();

  if (isE2EMode) {
    return e2eServices.auth.register(email, password) as Promise<User>;
  }

  const cred = await createUserWithEmailAndPassword(auth!, email, password);
  await setDoc(doc(db!, 'bears', `bear_${cred.user.uid}`), {
    id: `bear_${cred.user.uid}`,
    userId: cred.user.uid,
    name: 'Honey',
    level: 1,
    xp: 0,
    size: 'cub',
    accessories: [],
    mood: 'hungry',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return cred.user;
}

export async function login(email: string, password: string): Promise<User> {
  assertFirebaseConfigured();

  if (isE2EMode) {
    return e2eServices.auth.login(email, password) as Promise<User>;
  }

  const cred = await signInWithEmailAndPassword(auth!, email, password);
  return cred.user;
}

export async function logout(): Promise<void> {
  if (isE2EMode) {
    return e2eServices.auth.logout();
  }
  assertFirebaseConfigured();
  await signOut(auth!);
}

export function onAuthChanged(cb: (user: User | null) => void): () => void {
  if (isE2EMode) {
    return e2eServices.auth.onAuthChanged(
      cb as (user: { uid: string; email: string | null } | null) => void
    );
  }
  assertFirebaseConfigured();
  return onAuthStateChanged(auth!, cb);
}
