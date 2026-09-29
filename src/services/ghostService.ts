import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { GhostSession } from '../types/ghost';
import { INITIAL_SEEDED_GHOSTS } from '../utils/defaultGhosts';

const COLLECTION_NAME = 'ghostSessions';

/**
 * Fetch ghost sessions from Firestore with fallback to default ghosts
 */
export async function fetchGhostSessions(maxCount: number = 30): Promise<GhostSession[]> {
  if (!db) {
    console.info('[GhostService] Firestore not initialized, using local ghosts.');
    return INITIAL_SEEDED_GHOSTS;
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.info('[GhostService] No remote ghosts found in collection, using initial ghosts.');
      return INITIAL_SEEDED_GHOSTS;
    }

    const ghosts: GhostSession[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      ghosts.push({
        id: doc.id,
        visitorId: data.visitorId || `visitor_${Math.floor(Math.random() * 90 + 10)}`,
        visitorNumber: data.visitorNumber || Math.floor(Math.random() * 99 + 1),
        createdAt: data.createdAt || Date.now(),
        duration: data.duration || 10000,
        viewport: data.viewport || { width: 1440, height: 900 },
        path: Array.isArray(data.path) ? data.path : [],
        clicks: Array.isArray(data.clicks) ? data.clicks : [],
        color: data.color || '#a5b4fc',
        personality: data.personality || 'wanderer'
      });
    });

    return ghosts;
  } catch (err: any) {
    console.warn('[GhostService] Firestore read notice (falling back gracefully):', err.message);
    return INITIAL_SEEDED_GHOSTS;
  }
}

/**
 * Subscribe to real-time ghost additions
 */
export function subscribeGhostSessions(
  onUpdate: (ghosts: GhostSession[]) => void,
  maxCount: number = 30
): () => void {
  if (!db) {
    onUpdate(INITIAL_SEEDED_GHOSTS);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(INITIAL_SEEDED_GHOSTS);
          return;
        }

        const ghosts: GhostSession[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          ghosts.push({
            id: doc.id,
            visitorId: data.visitorId || `visitor_${Math.floor(Math.random() * 90 + 10)}`,
            visitorNumber: data.visitorNumber || Math.floor(Math.random() * 99 + 1),
            createdAt: data.createdAt || Date.now(),
            duration: data.duration || 10000,
            viewport: data.viewport || { width: 1440, height: 900 },
            path: Array.isArray(data.path) ? data.path : [],
            clicks: Array.isArray(data.clicks) ? data.clicks : [],
            color: data.color || '#a5b4fc',
            personality: data.personality || 'wanderer'
          });
        });

        onUpdate(ghosts);
      },
      (error) => {
        console.warn('[GhostService] Real-time subscription notice:', error.message);
        onUpdate(INITIAL_SEEDED_GHOSTS);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[GhostService] Subscribe setup error:', err);
    onUpdate(INITIAL_SEEDED_GHOSTS);
    return () => {};
  }
}

/**
 * Save current visitor's session to Firestore
 */
export async function saveGhostSession(session: Omit<GhostSession, 'id'>): Promise<string | null> {
  // Validate minimum requirements
  if (!session.path || session.path.length < 5 || session.duration < 2500) {
    console.info('[GhostService] Session too brief to persist as a wandering ghost.');
    return null;
  }

  // Cap points to prevent bloated documents
  const trimmedPath = session.path.slice(0, 350);
  const trimmedClicks = session.clicks.slice(0, 50);

  const payload = {
    visitorId: session.visitorId,
    visitorNumber: session.visitorNumber,
    createdAt: session.createdAt,
    duration: session.duration,
    viewport: session.viewport,
    path: trimmedPath,
    clicks: trimmedClicks,
    color: session.color,
    personality: session.personality
  };

  if (!db) {
    console.info('[GhostService] Local save only (Firebase not configured).');
    return 'local_saved';
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    console.info('[GhostService] Soul recorded in the ether:', docRef.id);
    return docRef.id;
  } catch (err: any) {
    console.warn('[GhostService] Firestore write notice:', err.message);
    return null;
  }
}
