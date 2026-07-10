import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBear } from '../hooks/useBear';
import { useCaves } from '../hooks/useCaves';
import { useMissions } from '../hooks/useMissions';
import {
  Bear,
  Cave,
  DailyMission,
  Streak,
  FeedResult,
  CaveProgress,
  MissionResult,
  getBearDisplayData,
} from '../types';

interface BearContextValue {
  bear: Bear | null;
  displayData: ReturnType<typeof getBearDisplayData> | null;
  caves: Cave[];
  mission: DailyMission | null;
  streak: Streak;
  loading: boolean;
  feed: (amount: number) => Promise<FeedResult>;
  deposit: (caveId: string, amount: number) => Promise<CaveProgress>;
  completeMission: () => Promise<MissionResult>;
  refetch: () => void;
}

const BearContext = createContext<BearContextValue | null>(null);

export function BearProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();
  const { bear, loading: bearLoading, feed, displayData } = useBear();
  const { caves, loading: cavesLoading, deposit } = useCaves();
  const { mission, streak, loading: missionsLoading, complete } = useMissions(bear);

  const loading = authLoading || bearLoading || cavesLoading || missionsLoading;

  const value = {
    bear,
    displayData,
    caves,
    mission,
    streak,
    loading,
    feed,
    deposit,
    completeMission: complete,
    refetch: () => {
      // trigger refetch
    },
  };

  return <BearContext.Provider value={value}>{children}</BearContext.Provider>;
}

export function useBearContext() {
  const context = useContext(BearContext);
  if (!context) throw new Error('useBearContext must be used within BearProvider');
  return context;
}
