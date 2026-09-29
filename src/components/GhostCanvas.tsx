import React, { useEffect, useRef } from 'react';
import { GhostSession, Ripple, ActiveGhost, GhostTrailPoint } from '../types/ghost';
import { interpolatePath, formatTimeAgo } from '../utils/interpolation';
import { playGhostChime, playGhostWhisper } from '../utils/audio';

interface GhostCanvasProps {
  ghosts: GhostSession[];
  userPos: { x: number; y: number; isTouch: boolean } | null;
  onNearGhost?: (ghost: GhostSession | null) => void;
}

export const GhostCanvas: React.FC<GhostCanvasProps> = ({ ghosts, userPos, onNearGhost }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeGhostsRef = useRef<ActiveGhost[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const userPosRef = useRef(userPos);
  const lastTimeRef = useRef<number>(performance.now());
  const hoveredGhostRef = useRef<ActiveGhost | null>(null);

  useEffect(() => {
    userPosRef.current = userPos;
  }, [userPos]);

  // Synchronize active ghosts when sessions change
  useEffect(() => {
    const existingMap = new Map<string, ActiveGhost>();
    activeGhostsRef.current.forEach((ag) => {
      existingMap.set(ag.session.id || ag.session.visitorId, ag);
    });

    // Organic baseline opacities across ghosts (some faint, some moderate, some clearer)
    const baseOpacities = [0.38, 0.65, 0.82, 0.48, 0.72, 0.55, 0.68, 0.42];

    const newActiveGhosts: ActiveGhost[] = ghosts.map((session, index) => {
      const key = session.id || session.visitorId;
      const existing = existingMap.get(key);
      if (existing) {
        existing.session = session;
        return existing;
      }

      // Initialize with staggered phase
      const timeOffset = (index * 3141) % Math.max(1, session.duration);
      const assignedOpacity = baseOpacities[index % baseOpacities.length];

      return {
        session,
        currentX: window.innerWidth * (session.path[0]?.x ?? 0.5),
        currentY: window.innerHeight * (session.path[0]?.y ?? 0.5),
        targetX: window.innerWidth * (session.path[0]?.x ?? 0.5),
        targetY: window.innerHeight * (session.path[0]?.y ?? 0.5),
        prevX: window.innerWidth * (session.path[0]?.x ?? 0.5),
        prevY: window.innerHeight * (session.path[0]?.y ?? 0.5),
        angle: -Math.PI / 4,
        playbackTime: timeOffset,
        speedMultiplier: 0.95 + (index % 3) * 0.05,
        timeOffset,
        opacity: assignedOpacity,
        trail: [],
        lastClickIndex: -1,
        isAwareOfPlayer: false,
        awarenessCooldown: 0,
        awarenessTimer: 0,
        repelVx: 0,
        repelVy: 0,
        flickerAlpha: 1.0
      };
    });

    activeGhostsRef.current = newActiveGhosts;
  }, [ghosts]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      // Pause if tab is hidden
      if (document.hidden) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min(64, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      ctx.clearRect(0, 0, screenW, screenH);

      const activeGhosts = activeGhostsRef.current;
      const currentUser = userPosRef.current;
      let closestGhost: ActiveGhost | null = null;
      let minUserDist = 120;

      // 1. UPDATE AND DRAW GHOSTS
      for (let i = 0; i < activeGhosts.length; i++) {
        const g = activeGhosts[i];
        const session = g.session;

        // Advance playback time
        if (g.awarenessTimer <= 0) {
          g.playbackTime += dt * g.speedMultiplier;
          if (g.playbackTime > session.duration) {
            g.playbackTime = g.playbackTime % Math.max(1, session.duration);
            g.lastClickIndex = -1; // Reset click cycle
          }
        } else {
          // Pauses briefly in surprise when noticing user
          g.awarenessTimer -= dt;
        }

        // Interpolate along normalized path
        const interp = interpolatePath(session.path, g.playbackTime, session.duration);
        let desiredX = interp.x * screenW;
        let desiredY = interp.y * screenH;

        // Check for click events at this timestamp
        if (session.clicks && session.clicks.length > 0) {
          for (let cIdx = 0; cIdx < session.clicks.length; cIdx++) {
            const click = session.clicks[cIdx];
            if (
              g.playbackTime >= click.t &&
              (g.lastClickIndex < cIdx || g.playbackTime - click.t < dt * 2)
            ) {
              if (g.lastClickIndex !== cIdx) {
                g.lastClickIndex = cIdx;
                ripplesRef.current.push({
                  x: click.x * screenW,
                  y: click.y * screenH,
                  radius: 2,
                  maxRadius: 42,
                  alpha: 0.65,
                  color: 'rgba(226, 232, 240, 0.6)'
                });
                playGhostChime(480 + (cIdx * 72));
              }
            }
          }
        }

        // Proximity detection with live user cursor
        if (currentUser) {
          const dx = g.currentX - currentUser.x;
          const dy = g.currentY - currentUser.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minUserDist) {
            minUserDist = dist;
            closestGhost = g;
          }

          // Awareness trigger (distance < 85px)
          if (dist < 85 && g.awarenessCooldown <= 0) {
            g.isAwareOfPlayer = true;
            g.awarenessTimer = 650; // pause for 650ms to "notice"
            g.awarenessCooldown = 4500; // don't repeat immediately

            // Repel velocity away from user
            const nx = dist > 0.01 ? dx / dist : 1;
            const ny = dist > 0.01 ? dy / dist : 0;
            g.repelVx = nx * 3.5;
            g.repelVy = ny * 3.5;

            playGhostWhisper();
          }
        }

        if (g.awarenessCooldown > 0) {
          g.awarenessCooldown -= dt;
          if (g.awarenessCooldown <= 2500) {
            g.isAwareOfPlayer = false;
          }
        }

        // Apply decay to repulsion velocity
        g.repelVx *= 0.94;
        g.repelVy *= 0.94;

        desiredX += g.repelVx * 12;
        desiredY += g.repelVy * 12;

        // Smooth physical lerp to target
        const lerpFactor = 0.18;
        g.prevX = g.currentX;
        g.prevY = g.currentY;
        g.currentX += (desiredX - g.currentX) * lerpFactor;
        g.currentY += (desiredY - g.currentY) * lerpFactor;

        // Smooth angle towards movement direction
        const moveDx = g.currentX - g.prevX;
        const moveDy = g.currentY - g.prevY;
        const moveDist = Math.sqrt(moveDx * moveDx + moveDy * moveDy);

        if (g.isAwareOfPlayer && currentUser) {
          // Look directly at user when aware
          g.angle = Math.atan2(currentUser.y - g.currentY, currentUser.x - g.currentX) + Math.PI / 4;
        } else if (moveDist > 0.5) {
          const targetAngle = Math.atan2(moveDy, moveDx) + Math.PI / 4;
          let diff = targetAngle - g.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          g.angle += diff * 0.15;
        }

        // OCCASIONAL SUBTLE FLICKER (rare, 120ms dip or momentary shimmer, not constant wave)
        const flickerCycle = (now + i * 4371) % 11000;
        if (flickerCycle < 140) {
          // Brief subtle dip ("was that ghost just there?")
          g.flickerAlpha = 0.45;
        } else if (flickerCycle > 140 && flickerCycle < 240) {
          // Soft return
          g.flickerAlpha = 0.85;
        } else {
          g.flickerAlpha = 1.0;
        }

        // Add trail point (clean, short trail that follows smoothly)
        if (moveDist > 1.0 || (now % 4 === 0)) {
          g.trail.push({
            x: g.currentX,
            y: g.currentY,
            alpha: 0.48,
            size: 2.8
          });
        }

        // Update and draw trail
        for (let t = g.trail.length - 1; t >= 0; t--) {
          const pt = g.trail[t];
          pt.alpha -= dt * 0.0022; // fades quickly and smoothly
          pt.size = Math.max(0.4, pt.size - dt * 0.0035);

          if (pt.alpha <= 0) {
            g.trail.splice(t, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(230, 236, 248, 0.45)';
          ctx.globalAlpha = pt.alpha * g.opacity * g.flickerAlpha;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Render Hero Ghost Cursor
        drawGhostPointer(
          ctx,
          g.currentX,
          g.currentY,
          g.angle,
          g.opacity * g.flickerAlpha * (g.isAwareOfPlayer ? 1.25 : 1.0),
          g.isAwareOfPlayer,
          session
        );
      }

      // Update hovered ghost callback
      if (closestGhost && minUserDist < 75) {
        if (hoveredGhostRef.current !== closestGhost) {
          hoveredGhostRef.current = closestGhost;
          onNearGhost?.(closestGhost.session);
        }
      } else {
        if (hoveredGhostRef.current !== null) {
          hoveredGhostRef.current = null;
          onNearGhost?.(null);
        }
      }

      // 2. RIPPLES (Soft, translucent, gentle fade)
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const ripple = ripplesRef.current[r];
        ripple.radius += dt * 0.045; // gentler expansion
        ripple.alpha -= dt * 0.001; // slow fade

        if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
          ripplesRef.current.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = Math.max(0, ripple.alpha);
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(226, 232, 240, 0.4)';
        ctx.stroke();

        // Soft secondary inner echo
        if (ripple.radius > 10) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.55, 0, Math.PI * 2);
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = Math.max(0, ripple.alpha * 0.35);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [onNearGhost]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};

/**
 * Draws a translucent white/cool-grey ghost cursor arrow with soft spiritual glow
 */
function drawGhostPointer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  alpha: number,
  isAware: boolean,
  session: GhostSession
) {
  ctx.save();
  ctx.translate(x, y);

  // Soft restrained aura halo
  const auraRadius = isAware ? 22 : 15;
  const aura = ctx.createRadialGradient(0, 0, 1, 0, 0, auraRadius);
  aura.addColorStop(0, 'rgba(240, 245, 255, 0.35)');
  aura.addColorStop(0.5, 'rgba(200, 215, 240, 0.12)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.globalAlpha = Math.min(1, alpha * (isAware ? 0.8 : 0.4));
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // Rotate to cursor orientation
  ctx.rotate(angle);

  // Ghost Cursor arrow path (translucent white/cool-grey, clean silhouette)
  ctx.globalAlpha = Math.min(1, alpha * 0.9);
  ctx.fillStyle = 'rgba(245, 248, 255, 0.82)';
  ctx.shadowBlur = isAware ? 12 : 6;
  ctx.shadowColor = 'rgba(226, 232, 240, 0.6)';
  ctx.strokeStyle = 'rgba(215, 225, 245, 0.85)';
  ctx.lineWidth = 1.0;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 15);
  ctx.lineTo(4, 11);
  ctx.lineTo(7.5, 17);
  ctx.lineTo(9.5, 16);
  ctx.lineTo(6.5, 10);
  ctx.lineTo(11, 10);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // Subtle floating identity label when aware
  if (isAware) {
    ctx.save();
    ctx.translate(x + 14, y + 14);
    ctx.globalAlpha = Math.min(0.9, alpha);

    // Pill background
    ctx.fillStyle = 'rgba(6, 8, 12, 0.9)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(-4, -12, 105, 20, 5);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    const timeStr = formatTimeAgo(session.createdAt);
    ctx.fillText(`Visitor #${session.visitorNumber} • ${timeStr}`, 2, 2);

    ctx.restore();
  }
}
