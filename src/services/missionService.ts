import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { isE2EMode } from '../config/runtime';
import { e2eGetOrCreateStreak, e2eGetTodaysMission, e2eCompleteMission } from './e2eStore';
import { DailyMission, Streak, MissionProgress, MissionType } from '../types';

const MISSION_TYPES: MissionType[] = ['save_amount', 'round_up', 'skip_purchase', 'custom'];
const MISSION_XP: Record<MissionType, number> = {
  save_amount: 50,
  round_up: 30,
  skip_purchase: 40,
  custom: 60,
};

function getMissionTarget(level: number, type: MissionType): number {
  const base = Math.min(500 + level * 100, 2000);
  switch (type) {
    case 'save_amount':
      return Math.round(base / 100) * 100;
    case 'round_up':
      return Math.min(3 + Math.floor(level / 2), 7);
    case 'skip_purchase':
      return Math.round(base / 200) * 100;
    case 'custom':
      return 1;
  }
}

function pickMissionForLevel(level: number): MissionType {
  const weights: Record<MissionType, number> = {
    save_amount: 0.5,
    round_up: 0.2,
    skip_purchase: 0.2,
    custom: 0.1,
  };
  if (level >= 7) weights.custom += 0.15;
  if (level >= 5) weights.round_up += 0.1;

  let sum = 0;
  for (const type of MISSION_TYPES) sum += weights[type];
  let r = Math.random() * sum;
  for (const type of MISSION_TYPES) {
    r -= weights[type];
    if (r <= 0) return type;
  }
  return 'save_amount';
}

export async function getOrCreateStreak(userId: string): Promise<Streak> {
  if (isE2EMode) return e2eGetOrCreateStreak(userId);

  const ref = doc(db, 'streaks', userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const streak: Streak = {
      current: 0,
      longest: 0,
      lastMissionDate: '',
      fireLevel: 0,
    };
    await setDoc(ref, { ...streak, userId, updatedAt: serverTimestamp() });
    return streak;
  }
  return snap.data() as Streak;
}

export async function getTodaysMission(
  userId: string,
  bearLevel: number
): Promise<DailyMission | null> {
  if (isE2EMode) return e2eGetTodaysMission(userId, bearLevel);

  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'missions', `${userId}_${today}`);
  const snap = await getDoc(ref);

  if (snap.exists()) return snap.data() as DailyMission;

  const type = pickMissionForLevel(bearLevel);
  const target = getMissionTarget(bearLevel, type);

  const mission: DailyMission = {
    id: ref.id,
    userId,
    type,
    target,
    completed: false,
    xpReward: MISSION_XP[type],
    date: today,
  };

  await setDoc(ref, { ...mission, createdAt: serverTimestamp() });
  return mission;
}

export async function completeMission(
  userId: string,
  mission: DailyMission
): Promise<MissionProgress> {
  if (isE2EMode) return e2eCompleteMission(userId, mission);

  const today = new Date().toISOString().split('T')[0];
  const streakRef = doc(db, 'streaks', userId);
  const streakSnap = await getDoc(streakRef);
  const streak = streakSnap.exists()
    ? (streakSnap.data() as Streak)
    : { current: 0, longest: 0, lastMissionDate: '', fireLevel: 0 };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = streak.current;
  if (streak.lastMissionDate === yesterdayStr) {
    newStreak = streak.current + 1;
  } else if (streak.lastMissionDate !== today) {
    newStreak = 1;
  }

  const fireLevel = newStreak >= 7 ? 3 : newStreak >= 3 ? 2 : newStreak > 0 ? 1 : 0;

  await updateDoc(doc(db, 'missions', mission.id), {
    completed: true,
    completedAt: serverTimestamp(),
  });

  await updateDoc(streakRef, {
    current: newStreak,
    longest: Math.max(newStreak, streak.longest),
    lastMissionDate: today,
    fireLevel,
    updatedAt: serverTimestamp(),
  });

  const badges: string[] = [];
  if (newStreak === 7) badges.push('week_streak');
  if (newStreak === 30) badges.push('iron_gut');

  return {
    xpEarned: mission.xpReward,
    newStreak,
    fireLevel,
    badgesEarned: badges,
  };
}

export async function getMissionProgress(userId: string): Promise<DailyMission[]> {
  if (isE2EMode) return [];
  return [];
}
