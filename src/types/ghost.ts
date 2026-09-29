export interface CursorPoint {
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
  t: number; // Timestamp offset in ms from session start
}

export interface GhostClick {
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
  t: number; // Timestamp offset in ms from session start
}

export interface GhostSession {
  id?: string;
  visitorId: string;
  visitorNumber: number;
  createdAt: number; // epoch ms
  duration: number; // total duration in ms
  viewport: {
    width: number;
    height: number;
  };
  path: CursorPoint[];
  clicks: GhostClick[];
  color?: string; // HSL or hex tint for uniqueness
  personality?: 'curious' | 'fast' | 'hesitant' | 'clicker' | 'wanderer' | 'mysterious' | 'playful';
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface GhostTrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
}

export interface ActiveGhost {
  session: GhostSession;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  prevX: number;
  prevY: number;
  angle: number;
  playbackTime: number; // current ms offset
  speedMultiplier: number;
  timeOffset: number; // staggered phase so loops don't all align
  opacity: number;
  trail: GhostTrailPoint[];
  lastClickIndex: number;
  // Interaction with player
  isAwareOfPlayer: boolean;
  awarenessCooldown: number;
  awarenessTimer: number;
  repelVx: number;
  repelVy: number;
  flickerAlpha: number;
}
