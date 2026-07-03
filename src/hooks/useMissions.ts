import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getOrCreateStreak, getTodaysMission, completeMission } from '../services/missionService';
import { DailyMission, Streak, MissionProgress, Bear } from '../types';

export function useMissions(bear: Bear | null) {
  const { user, loading: authLoading } = useAuth();
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [streak, setStreak] = useState<Streak>({
    current: 0,
    longest: 0,
    lastMissionDate: '',
    fireLevel: 0,
  });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (authLoading || !user || !bear) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getOrCreateStreak(user.uid).then(setStreak);
    getTodaysMission(user.uid, bear.level).then(setMission);
  }, [user, authLoading, bear?.level]);

  const complete = async (): Promise<MissionProgress> => {
    if (!mission || mission.completed || !user) throw new Error('Cannot complete mission');
    setCompleting(true);
    try {
      const result = await completeMission(user.uid, mission);
      setStreak(result.streak);
      setMission({ ...mission, completed: true });
      return result;
    } finally {
      setCompleting(false);
    }
  };

  return {
    mission,
    streak,
    loading: authLoading || loading,
    completing,
    complete,
    hasMission: !!mission,
    isCompleted: mission?.completed ?? false,
  };
}
