import { Bear, Cave, Size, Mood, LEVEL_XP } from '../types';

export function calculateSize(level: number): Size {
  if (level <= 3) return 'cub';
  if (level <= 7) return 'grown';
  return 'giant';
}

export function calculateMood(lastFeedDate: string | null, xp: number): Mood {
  if (!lastFeedDate) return 'hungry';
  const daysSinceFeed = Math.floor(
    (Date.now() - new Date(lastFeedDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceFeed === 0) return xp > 500 ? 'ecstatic' : 'happy';
  if (daysSinceFeed <= 1) return 'content';
  return 'hungry';
}

export function calculateLevel(xp: number): number {
  for (let level = 10; level >= 1; level--) {
    if (xp >= LEVEL_XP[level]) return level;
  }
  return 1;
}

export function xpForNextLevel(level: number): number {
  if (level >= 10) return 0;
  return LEVEL_XP[level + 1];
}

export function getBearDisplayData(bear: Bear) {
  const currentLevelXp = bear.xp - (bear.level > 1 ? LEVEL_XP[bear.level - 1] : 0);
  const nextLevelXp = xpForNextLevel(bear.level);
  const progress = nextLevelXp > 0 ? currentLevelXp / nextLevelXp : 1;
  return {
    size: bear.size,
    level: bear.level,
    xpProgress: progress,
    xpToNext: nextLevelXp - currentLevelXp,
    accessories: bear.accessories,
    mood: bear.mood,
  };
}

export function getCaveProgress(cave: Cave): number {
  if (cave.targetAmount <= 0) return 0;
  return Math.min(cave.currentAmount / cave.targetAmount, 1);
}
