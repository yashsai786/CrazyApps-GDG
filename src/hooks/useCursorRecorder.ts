import { useEffect, useRef, useState, useCallback } from 'react';
import { CursorPoint, GhostClick, GhostSession } from '../types/ghost';
import { saveGhostSession } from '../services/ghostService';

const THROTTLE_MS = 45;
const MIN_DISTANCE_NORMALIZED = 0.002;
const MIN_POINTS_TO_PERSIST = 8;
const MIN_DURATION_TO_PERSIST = 3000;

export function useCursorRecorder() {
  const [visitorId] = useState(() => {
    const saved = sessionStorage.getItem('ghost_visitor_id');
    if (saved) return saved;
    const generated = `visitor_${Math.floor(10 + Math.random() * 89)}`;
    sessionStorage.setItem('ghost_visitor_id', generated);
    return generated;
  });

  const [visitorNumber] = useState(() => {
    const saved = sessionStorage.getItem('ghost_visitor_num');
    if (saved) return parseInt(saved, 10);
    const generated = Math.floor(10 + Math.random() * 89);
    sessionStorage.setItem('ghost_visitor_num', generated.toString());
    return generated;
  });

  const [currentPos, setCurrentPos] = useState<{ x: number; y: number; isTouch: boolean } | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [persisted, setPersisted] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const pathRef = useRef<CursorPoint[]>([]);
  const clicksRef = useRef<GhostClick[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const isSavingRef = useRef<boolean>(false);

  // Save session function
  const triggerSave = useCallback(async () => {
    if (isSavingRef.current || persisted) return;
    const duration = Date.now() - startTimeRef.current;
    const path = pathRef.current;

    if (path.length < MIN_POINTS_TO_PERSIST || duration < MIN_DURATION_TO_PERSIST) {
      return;
    }

    isSavingRef.current = true;
    try {
      const sessionData: Omit<GhostSession, 'id'> = {
        visitorId,
        visitorNumber,
        createdAt: startTimeRef.current,
        duration,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        path: [...path],
        clicks: [...clicksRef.current],
        color: '#e0e7ff', // crisp spectral silver for live visitor
        personality: 'curious'
      };

      const result = await saveGhostSession(sessionData);
      if (result) {
        setPersisted(true);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [visitorId, visitorNumber, persisted]);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const recordPoint = (clientX: number, clientY: number, isTouch = false) => {
      setHasInteracted(true);
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);

      const normX = Math.max(0, Math.min(1, clientX / width));
      const normY = Math.max(0, Math.min(1, clientY / height));

      setCurrentPos({ x: clientX, y: clientY, isTouch });

      const now = Date.now();
      const timeOffset = now - startTimeRef.current;
      const timeDelta = now - lastSampleTimeRef.current;

      const lastPos = lastPosRef.current;
      let dist = 1;
      if (lastPos) {
        const dx = normX - lastPos.x;
        const dy = normY - lastPos.y;
        dist = Math.sqrt(dx * dx + dy * dy);
      }

      // Sample if enough time passed and moved or after pause
      if (timeDelta >= THROTTLE_MS && (dist >= MIN_DISTANCE_NORMALIZED || timeDelta > 300)) {
        pathRef.current.push({
          x: Math.round(normX * 10000) / 10000,
          y: Math.round(normY * 10000) / 10000,
          t: timeOffset
        });
        lastSampleTimeRef.current = now;
        lastPosRef.current = { x: normX, y: normY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      recordPoint(e.clientX, e.clientY, false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        recordPoint(touch.clientX, touch.clientY, true);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      const normX = Math.max(0, Math.min(1, e.clientX / width));
      const normY = Math.max(0, Math.min(1, e.clientY / height));
      const timeOffset = Date.now() - startTimeRef.current;

      clicksRef.current.push({
        x: Math.round(normX * 10000) / 10000,
        y: Math.round(normY * 10000) / 10000,
        t: timeOffset
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerSave();
      }
    };

    const handleBeforeUnload = () => {
      triggerSave();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) recordPoint(e.touches[0].clientX, e.touches[0].clientY, true);
    }, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also periodic auto-save after 14 seconds of activity if qualified
    const autoSaveTimer = setTimeout(() => {
      triggerSave();
    }, 14000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(autoSaveTimer);
    };
  }, [triggerSave]);

  return {
    visitorId,
    visitorNumber,
    currentPos,
    hasInteracted,
    persisted,
    triggerSave
  };
}
