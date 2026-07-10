import { BadgeId } from '../types';

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  emoji: string;
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_deposit',
    title: 'First Step',
    description: 'Made your first deposit',
    emoji: '🌱',
  },
  {
    id: 'first_feed',
    title: 'First Feed',
    description: 'Fed your bear for the first time',
    emoji: '🍯',
  },
  {
    id: 'halfway',
    title: 'Halfway There',
    description: 'Reached 50% of a goal',
    emoji: '🌳',
  },
  {
    id: 'completed',
    title: 'Goal Crusher',
    description: 'Completed a goal',
    emoji: '🏆',
  },
  {
    id: 'streak_3',
    title: '3-Month Streak',
    description: 'Deposited 3 months in a row',
    emoji: '🔥',
  },
  {
    id: 'streak_6',
    title: '6-Month Streak',
    description: 'Deposited 6 months in a row',
    emoji: '⚡',
  },
  {
    id: 'multi_goal',
    title: 'Goal Collector',
    description: 'Created 3 or more goals',
    emoji: '🎯',
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Completed missions 7 days in a row',
    emoji: '📅',
  },
  {
    id: 'furnished_cave',
    title: 'Interior Designer',
    description: 'Fully furnished a cave',
    emoji: '🛋️',
  },
  {
    id: 'level_5',
    title: 'Growing Bear',
    description: 'Reached bear level 5',
    emoji: '🐻',
  },
  {
    id: 'honey_hoarder',
    title: 'Honey Hoarder',
    description: 'Saved $1,000 in total',
    emoji: '💰',
  },
  {
    id: 'cave_master',
    title: 'Cave Master',
    description: 'Completed all caves',
    emoji: '🏔️',
  },
  {
    id: 'iron_gut',
    title: 'Iron Gut',
    description: 'Completed 30 missions without missing a day',
    emoji: '💪',
  },
  {
    id: 'bear_whisperer',
    title: 'Bear Whisperer',
    description: 'Reached bear level 10',
    emoji: '🎓',
  },
  {
    id: 'giant_bear',
    title: 'Giant Bear',
    description: 'Bear reached giant size',
    emoji: '🦣',
  },
  {
    id: 'mission_master',
    title: 'Mission Master',
    description: 'Completed 50 missions total',
    emoji: '🎖️',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Earned all other badges',
    emoji: '👑',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Completed a mission before 8 AM',
    emoji: '🌅',
  },
];

export function computeEarnedBadges(params: {
  totalDeposits: number;
  currentStreak: number;
  goalCount: number;
  hasHalfway: boolean;
  hasCompleted: boolean;
  existingBadges: BadgeId[];
}): BadgeId[] {
  const { totalDeposits, currentStreak, goalCount, hasHalfway, hasCompleted, existingBadges } =
    params;
  const earned = new Set<BadgeId>(existingBadges);

  if (totalDeposits >= 1) earned.add('first_deposit');
  if (hasHalfway) earned.add('halfway');
  if (hasCompleted) earned.add('completed');
  if (currentStreak >= 3) earned.add('streak_3');
  if (currentStreak >= 6) earned.add('streak_6');
  if (goalCount >= 3) earned.add('multi_goal');

  return Array.from(earned);
}
