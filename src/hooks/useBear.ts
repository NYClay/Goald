import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getBear, subscribeBear, feedBear, getBearDisplayData } from '../services/bearService';
import { Bear, FeedResult, getBearDisplayData as getDisplayData } from '../types';

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

    getBear(bearId).then((b) => {
      setBear(b);
      setLoading(false);
    });

    return subscribeBear(bearId, (b) => {
      setBear(b);
      setLoading(false);
    });
  }, [user, authLoading]);

  const feed = async (amountCents: number): Promise<FeedResult> => {
    if (!bear) throw new Error('No bear found');
    setFeeding(true);
    try {
      const result = await feedBear(bear.id, amountCents);
      return result;
    } finally {
      setFeeding(false);
    }
  };

  const displayData = bear ? getDisplayData(bear) : null;

  return {
    bear,
    loading: authLoading || loading,
    feeding,
    displayData,
    feed,
    refetch: () => user && getBear(`bear_${user.uid}`).then(setBear),
  };
}
