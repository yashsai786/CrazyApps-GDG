import React from 'react';
import { GhostSession } from '../types/ghost';
import { formatTimeAgo } from '../utils/interpolation';

interface HeroHeaderProps {
  ghostCount: number;
  loading: boolean;
  nearGhost: GhostSession | null;
  hasInteracted: boolean;
  persisted: boolean;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  ghostCount,
  loading,
  nearGhost,
  hasInteracted,
  persisted
}) => {
  const renderStatus = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-2 text-zinc-500 text-xs tracking-[0.2em] uppercase font-['Inter']">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          Calling the ghosts...
        </span>
      );
    }

    if (ghostCount === 0) {
      return (
        <span className="text-zinc-500 text-xs tracking-[0.2em] uppercase font-['Inter']">
          No ghosts yet. Leave something behind.
        </span>
      );
    }

    if (ghostCount === 1) {
      return (
        <span className="inline-flex items-center gap-2 text-zinc-400 text-xs tracking-[0.2em] uppercase font-['Inter']">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          1 ghost is still here
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 text-zinc-400 text-xs tracking-[0.2em] uppercase font-['Inter']">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-pulse" />
        {ghostCount} ghosts are still here
      </span>
    );
  };

  return (
    <header className="pointer-events-none fixed top-12 md:top-16 inset-x-0 flex flex-col items-center justify-center text-center z-20 px-6 select-none transition-opacity duration-1000">
      {/* Primary Quiet Atmospheric Heading */}
      <h1 className="font-['Cinzel'] tracking-[0.28em] text-2xl sm:text-3xl md:text-[2.25rem] font-light text-zinc-200 drop-shadow-[0_2px_16px_rgba(255,255,255,0.08)] mb-2.5">
        You are not alone.
      </h1>

      {/* Whispered Subtitle */}
      <p className="font-['Inter'] text-xs sm:text-sm font-light text-zinc-500 tracking-[0.2em] mb-4">
        Every visitor leaves a ghost.
      </p>

      {/* Refined Dynamic Live Ghost Count */}
      <div className="h-6 flex items-center justify-center transition-all duration-500">
        {renderStatus()}
      </div>

      {/* Subtle Near-Ghost Awareness Notification */}
      <div 
        className={`mt-4 transition-all duration-500 transform ${
          nearGhost ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {nearGhost && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950/70 border border-zinc-800 text-[11px] font-['JetBrains_Mono'] text-zinc-300 backdrop-blur-md">
            <span className="w-1 h-1 rounded-full bg-zinc-400 animate-ping" />
            <span>Visitor #{nearGhost.visitorNumber} ({formatTimeAgo(nearGhost.createdAt)}) noticed your presence</span>
          </div>
        )}
      </div>

      {/* Saved Notice */}
      {persisted && (
        <div className="mt-2 text-[10px] tracking-[0.2em] uppercase font-['JetBrains_Mono'] text-zinc-400 animate-fade-in">
          ✧ Your ghost has joined the room
        </div>
      )}
    </header>
  );
};
