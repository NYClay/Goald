import { createContext, useContext, useMemo, ReactNode } from 'react';
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
} from '../types';
import { getBearDisplayData } from '../utils/bearUtils';

interface AppContextValue {
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

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();
  const { bear, loading: bearLoading, feed, displayData, refetch: refetchBear } = useBear();
  const { caves, loading: cavesLoading, deposit, refetch: refetchCaves } = useCaves();
  const { mission, streak, loading: missionsLoading, complete } = useMissions(bear);

  const loading = authLoading || bearLoading || cavesLoading || missionsLoading;

  const value = useMemo<AppContextValue>(
    () => ({
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
        refetchBear();
        refetchCaves();
      },
    }),
    [
      bear,
      displayData,
      caves,
      mission,
      streak,
      loading,
      feed,
      deposit,
      complete,
      refetchBear,
      refetchCaves,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
