import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getBear, subscribeBear, feedBear } from '../services/bearService';
import { Bear, FeedResult } from '../types';
import { getBearDisplayData } from '../utils/bearUtils';

export function useBear() {
  const { user, loading: authLoading } = useAuth();
  const [bear, setBear] = useState<Bear | null>(null);
  const [loading, setLoading] = useState(true);
  const [feeding, setFeeding] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      setBear(null);
      return;
    }

    setLoading(true);
    const bearId = `bear_${user.uid}`;

    return subscribeBear(bearId, (b) => {
      setBear(b);
      setLoading(false);
    });
  }, [user, authLoading]);

  const feed = useCallback(
    async (amountCents: number): Promise<FeedResult> => {
      if (!bear) throw new Error('No bear found');
      setFeeding(true);
      try {
        const result = await feedBear(bear.id, amountCents);
        return result;
      } finally {
        setFeeding(false);
      }
    },
    [bear]
  );

  const displayData = bear ? getBearDisplayData(bear) : null;

  const refetch = useCallback(() => {
    if (!user) return;
    getBear(`bear_${user.uid}`).then(setBear);
  }, [user]);

  return {
    bear,
    loading: authLoading || loading,
    feeding,
    displayData,
    feed,
    refetch,
  };
}
