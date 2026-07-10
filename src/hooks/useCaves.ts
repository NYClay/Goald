import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserCaves, subscribeUserCaves, depositToCave } from '../services/caveService';
import { Cave, CaveProgress } from '../types';
import { getCaveProgress } from '../utils/bearUtils';

export function useCaves() {
  const { user, loading: authLoading } = useAuth();
  const [caves, setCaves] = useState<Cave[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      setCaves([]);
      return;
    }

    setLoading(true);
    const unsub = subscribeUserCaves(user.uid, (c) => {
      setCaves(c);
      setLoading(false);
    });
    return unsub;
  }, [user, authLoading]);

  const deposit = async (caveId: string, amountCents: number): Promise<CaveProgress> => {
    setDepositing(caveId);
    try {
      return await depositToCave(caveId, amountCents);
    } finally {
      setDepositing(null);
    }
  };

  const getProgress = (cave: Cave) => getCaveProgress(cave);

  return {
    caves,
    loading: authLoading || loading,
    depositing,
    deposit,
    getProgress,
    refetch: () => user && getUserCaves(user.uid).then(setCaves),
  };
}
