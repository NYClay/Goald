import { UserStats, BadgeId } from '../types';
import { computeEarnedBadges } from './badges';

export interface DepositStatsInput {
  currentBalance: number;
  targetAmount: number;
  depositAmount: number;
  stats: UserStats;
  goalCount: number;
  existingBadges: BadgeId[];
}

export interface DepositStatsOutput {
  newBalance: number;
  crossedMilestones: number[];
  isCompleted: boolean;
  wasBelowHalfway: boolean;
  isNowAtOrAboveHalfway: boolean;
  newStreak: number;
  currentMonth: string;
  newTotalDeposits: number;
  newBadges: BadgeId[];
}

export function getCrossedMilestones(previousProgress: number, nextProgress: number): number[] {
  const milestones = [25, 50, 75];
  return milestones.filter((m) => previousProgress < m / 100 && nextProgress >= m / 100);
}

export function calculateStreak(
  currentStreak: number,
  lastDepositMonth: string
): { newStreak: number; currentMonth: string } {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (lastDepositMonth === currentMonth) {
    return { newStreak: currentStreak, currentMonth };
  }

  if (!lastDepositMonth) {
    return { newStreak: 1, currentMonth };
  }

  const last = new Date(lastDepositMonth + '-01');
  const diffMonths =
    (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());
  const newStreak = diffMonths === 1 ? currentStreak + 1 : 1;

  return { newStreak, currentMonth };
}

export function computeDepositStats(input: DepositStatsInput): DepositStatsOutput {
  const { currentBalance, targetAmount, depositAmount, stats, goalCount, existingBadges } = input;

  const newBalance = currentBalance + depositAmount;
  const previousProgress = targetAmount > 0 ? currentBalance / targetAmount : 0;
  const nextProgress = targetAmount > 0 ? newBalance / targetAmount : 0;
  const crossedMilestones = getCrossedMilestones(previousProgress, nextProgress);
  const isCompleted = newBalance >= targetAmount;
  const wasBelowHalfway = currentBalance / targetAmount < 0.5;
  const isNowAtOrAboveHalfway = newBalance / targetAmount >= 0.5;

  const { newStreak, currentMonth } = calculateStreak(stats.currentStreak, stats.lastDepositMonth);

  const newTotalDeposits = stats.totalDeposits + 1;

  const newBadges = computeEarnedBadges({
    totalDeposits: newTotalDeposits,
    currentStreak: newStreak,
    goalCount,
    hasHalfway: wasBelowHalfway && isNowAtOrAboveHalfway,
    hasCompleted: isCompleted,
    existingBadges,
  });

  return {
    newBalance,
    crossedMilestones,
    isCompleted,
    wasBelowHalfway,
    isNowAtOrAboveHalfway,
    newStreak,
    currentMonth,
    newTotalDeposits,
    newBadges,
  };
}
