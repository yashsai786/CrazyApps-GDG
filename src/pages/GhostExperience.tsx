import React, { useState, useEffect, useRef } from 'react';
import { useGhosts } from '../hooks/useGhosts';
import { useCursorRecorder } from '../hooks/useCursorRecorder';
import { GhostCanvas } from '../components/GhostCanvas';
import { Atmosphere } from '../components/Atmosphere';
import { HeroHeader } from '../components/HeroHeader';
import { AudioControl } from '../components/AudioControl';
import { PrivacyBadge } from '../components/PrivacyBadge';
import { GhostSession } from '../types/ghost';
import { ArrowLeft } from 'lucide-react';

interface GhostExperienceProps {
  onBack: () => void;
}

export const GhostExperience: React.FC<GhostExperienceProps> = ({ onBack }) => {
  const { ghosts, loading } = useGhosts();
  const { 
    visitorNumber, 
    currentPos, 
    hasInteracted, 
    persisted 
  } = useCursorRecorder();

  const [nearGhost, setNearGhost] = useState<GhostSession | null>(null);
  // Default is GHOST cursor skin
  const [cursorMode, setCursorMode] = useState<'ghost' | 'normal'>('ghost');
  const ghostCursorRef = useRef<HTMLDivElement | null>(null);

  // Sync cursor mode with body class to hide native pointer in ghost mode
  useEffect(() => {
    if (cursorMode === 'ghost') {
      document.body.classList.add('ghost-cursor-mode');
    } else {
      document.body.classList.remove('ghost-cursor-mode');
    }

    return () => {
      document.body.classList.remove('ghost-cursor-mode');
    };
  }, [cursorMode]);

  // Direct high-performance pointer following for the 👻 cursor skin (zero latency, zero animation)
  useEffect(() => {
    if (cursorMode !== 'ghost') return;

    const el = ghostCursorRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      // Offset -2px, -2px so the exact click point is right at the top-left of the emoji
      el.style.transform = `translate3d(${e.clientX - 2}px, ${e.clientY - 2}px, 0)`;
      el.style.display = 'block';
    };

    const onMouseLeave = () => {
      el.style.display = 'none';
    };

    const onMouseEnter = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX - 2}px, ${e.clientY - 2}px, 0)`;
      el.style.display = 'block';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [cursorMode]);

  return (
    <div className={`relative w-full h-full min-h-screen bg-black overflow-hidden select-none ${cursorMode === 'ghost' ? 'ghost-cursor-mode' : ''}`}>
      {/* Subtle Environment Back Navigation (Top Left) */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/40 hover:bg-zinc-900/60 border border-zinc-800/40 hover:border-zinc-700/60 text-xs font-['Inter'] text-zinc-500 hover:text-zinc-300 transition-all duration-300 backdrop-blur-sm focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5 opacity-70" />
        <span>Choose another experience</span>
      </button>

      {/* Subtle Cursor Style Selector (Top Right) */}
      <div
        role="radiogroup"
        aria-label="Cursor style selector"
        className="fixed top-6 right-6 z-30 inline-flex items-center p-0.5 rounded-full bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-sm text-[11px] font-['Inter'] select-none shadow-[0_0_12px_rgba(0,0,0,0.5)]"
      >
        <button
          type="button"
          role="radio"
          aria-checked={cursorMode === 'ghost'}
          aria-label="Ghost cursor"
          onClick={() => setCursorMode('ghost')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
            cursorMode === 'ghost'
              ? 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/70 shadow-[0_0_8px_rgba(255,255,255,0.15)] font-medium'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xs">👻</span>
          <span>Ghost</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={cursorMode === 'normal'}
          aria-label="Normal cursor"
          onClick={() => setCursorMode('normal')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
            cursorMode === 'normal'
              ? 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/70 shadow-[0_0_8px_rgba(255,255,255,0.15)] font-medium'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-[10px]">↖</span>
          <span>Normal</span>
        </button>
      </div>

      {/* Simple 👻 Cursor Skin (Active only in Ghost mode, zero trails, zero extra animation) */}
      {cursorMode === 'ghost' && (
        <div
          ref={ghostCursorRef}
          className="ghost-cursor-skin"
          aria-hidden="true"
        >
          👻
        </div>
      )}

      {/* 1. Atmospheric ethereal background & subtle ambient lighting */}
      <Atmosphere />

      {/* 2. Canvas layer: previous visitor ghost replay & click ripples */}
      <GhostCanvas 
        ghosts={ghosts} 
        userPos={currentPos} 
        onNearGhost={setNearGhost} 
      />

      {/* 3. Hero Header with dynamic ghost counter and minimal typography */}
      <HeroHeader 
        ghostCount={ghosts.length} 
        loading={loading} 
        nearGhost={nearGhost}
        hasInteracted={hasInteracted}
        persisted={persisted}
      />

      {/* 4. Subtle central guidance hint */}
      <div 
        className="ghost-interaction-hint"
        style={{ opacity: hasInteracted ? 0.35 : 0.8 }}
      >
        Move around. They remember.
      </div>

      {/* 5. Minimal anonymous privacy disclosure */}
      <PrivacyBadge visitorNumber={visitorNumber} />

      {/* 6. Subtle audio toggle */}
      <AudioControl />
    </div>
  );
};
