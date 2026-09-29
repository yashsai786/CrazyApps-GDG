import { CursorPoint } from '../types/ghost';

/**
 * Given a normalized path and a target timestamp offset (ms),
 * finds the interpolated x, y and heading angle.
 */
export function interpolatePath(
  path: CursorPoint[],
  timeMs: number,
  duration: number
): { x: number; y: number; angle: number; isPaused: boolean } {
  if (!path || path.length === 0) {
    return { x: 0.5, y: 0.5, angle: 0, isPaused: true };
  }

  if (path.length === 1) {
    return { x: path[0].x, y: path[0].y, angle: 0, isPaused: true };
  }

  // Wrap time within total duration
  const loopedTime = timeMs % Math.max(duration, 1000);

  // Find surrounding points
  let idx = 0;
  while (idx < path.length - 1 && path[idx + 1].t <= loopedTime) {
    idx++;
  }

  const p0 = path[Math.max(0, idx - 1)];
  const p1 = path[idx];
  const p2 = path[Math.min(path.length - 1, idx + 1)];
  const p3 = path[Math.min(path.length - 1, idx + 2)];

  const tSpan = Math.max(1, p2.t - p1.t);
  const tLocal = Math.max(0, Math.min(1, (loopedTime - p1.t) / tSpan));

  // Catmull-Rom spline interpolation for smooth curves
  const x = catmullRom(p0.x, p1.x, p2.x, p3.x, tLocal);
  const y = catmullRom(p0.y, p1.y, p2.y, p3.y, tLocal);

  // Calculate velocity / heading direction
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const isPaused = dist < 0.003 || tSpan > 2500;

  let angle = Math.atan2(dy, dx);
  // Default cursor point angle offset
  if (isNaN(angle)) angle = -Math.PI / 4;

  return { x, y, angle, isPaused };
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;

  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

/**
 * Format relative time (e.g., "2m ago", "18m ago", "2h ago", "just now")
 */
export function formatTimeAgo(timestamp: number): string {
  const elapsed = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
