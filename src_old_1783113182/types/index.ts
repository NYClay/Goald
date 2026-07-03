import { Timestamp } from 'firebase/firestore';
import { ThemeType } from './Theme';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  timelineMonths?: number;
  visualTheme: ThemeType;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  currentBalance: number;
}

export interface Deposit {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: Timestamp;
  note?: string;
}

export interface UserStats {
  currentStreak: number;
  lastDepositMonth: string;
  badges: string[];
  totalDeposits: number;
}

export type BadgeId =
  | 'first_deposit'
  | 'halfway'
  | 'completed'
  | 'streak_3'
  | 'streak_6'
  | 'multi_goal';
