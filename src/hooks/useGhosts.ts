import { useEffect, useState } from 'react';
import { GhostSession } from '../types/ghost';
import { subscribeGhostSessions, fetchGhostSessions } from '../services/ghostService';
import { INITIAL_SEEDED_GHOSTS } from '../utils/defaultGhosts';

export function useGhosts() {
  const [ghosts, setGhosts] = useState<GhostSession[]>(INITIAL_SEEDED_GHOSTS);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  useEffect(() => {
    let isMounted = true;

    // Fast initial fetch
    fetchGhostSessions(35)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setGhosts(data);
          setConnectionStatus('connected');
        } else {
          setGhosts(INITIAL_SEEDED_GHOSTS);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setGhosts(INITIAL_SEEDED_GHOSTS);
        setConnectionStatus('offline');
        setLoading(false);
      });

    // Realtime listener
    const unsubscribe = subscribeGhostSessions((updated) => {
      if (!isMounted) return;
      if (updated && updated.length > 0) {
        setGhosts(updated);
        setConnectionStatus('connected');
      }
      setLoading(false);
    }, 35);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { ghosts, loading, connectionStatus };
}
