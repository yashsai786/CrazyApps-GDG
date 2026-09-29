import React, { useState } from 'react';
import { ArrowRight, Sparkles, Ghost, Scan, Eye, Compass, ShieldAlert, Cpu } from 'lucide-react';

interface LandingPageProps {
  onSelectUseful: () => void;
  onSelectNotUseful: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectUseful,
  onSelectNotUseful
}) => {
  const [hoveredSide, setHoveredSide] = useState<'useful' | 'not-useful' | null>(null);

  return (
    <div className="relative w-full min-h-screen bg-[#050608] text-zinc-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background ambient lighting reacting to hover */}
      <div 
        className="pointer-events-none fixed inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background: hoveredSide === 'useful' 
            ? 'radial-gradient(circle at 25% 40%, rgba(14, 165, 233, 0.12), transparent 55%)'
            : hoveredSide === 'not-useful'
            ? 'radial-gradient(circle at 75% 40%, rgba(139, 92, 246, 0.15), transparent 55%)'
            : 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.06), transparent 60%)'
        }}
      />


      {/* Top Header */}
      <header className="relative z-10 pt-12 md:pt-16 pb-8 text-center px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-['JetBrains_Mono'] tracking-widest uppercase text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>A Dual Perspective Experiment</span>
        </div>

        <h1 className="font-['Cinzel'] text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.2em] text-zinc-100 drop-shadow-[0_2px_15px_rgba(255,255,255,0.12)] mb-3">
          Choose your purpose.
        </h1>

        <p className="font-['Inter'] text-sm sm:text-base font-light text-zinc-400 tracking-[0.16em]">
          One might actually help someone. The other is completely useless.
        </p>
      </header>

      {/* Main Split Portal Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-6 flex flex-col md:flex-row items-stretch gap-6 md:gap-8 justify-center">
        
        {/* USEFUL PORTAL */}
        <div
          onMouseEnter={() => setHoveredSide('useful')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={onSelectUseful}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectUseful()}
          className="group relative flex-1 min-h-[420px] rounded-2xl p-8 sm:p-10 flex flex-col justify-between cursor-pointer border transition-all duration-500 overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-md border-cyan-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        >
          {/* Subtle scanning laser line effect on hover */}
          <div className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 top-0 group-hover:animate-[scanline_2.8s_ease-in-out_infinite]" />

          {/* Vision reticle corner markers */}
          <div className="pointer-events-none absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-cyan-400/40 group-hover:border-cyan-400 transition-colors" />
          <div className="pointer-events-none absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-cyan-400/40 group-hover:border-cyan-400 transition-colors" />
          <div className="pointer-events-none absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-cyan-400/40 group-hover:border-cyan-400 transition-colors" />
          <div className="pointer-events-none absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-cyan-400/40 group-hover:border-cyan-400 transition-colors" />

          {/* Top category label */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-['JetBrains_Mono'] tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                ✦ USEFUL
              </span>
              <span className="text-[10px] font-['JetBrains_Mono'] text-cyan-400/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                ABSENT AI VISION
              </span>
            </div>

            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl text-zinc-100 group-hover:text-cyan-100 tracking-wider font-light mb-3 transition-colors">
              AI that looks for what isn't there.
            </h2>

            <p className="font-['Inter'] text-sm text-zinc-400 group-hover:text-zinc-300 leading-relaxed mb-6 transition-colors">
              Point your camera at the physical world. ABSENT reasons about missing ramps, obstructed exits, invisible recycling, or safety gaps.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-cyan-400/80">
              <Scan className="w-3.5 h-3.5 animate-pulse" />
              <span>Point. Scan. Discover.</span>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="pt-8 border-t border-zinc-800/80 group-hover:border-cyan-500/30 transition-colors flex items-center justify-between">
            <span className="text-sm font-['Inter'] font-medium text-cyan-300 group-hover:translate-x-1 transition-transform flex items-center gap-2">
              Find what's missing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-500 group-hover:text-cyan-400/70 transition-colors">
              Groq Vision 27B
            </span>
          </div>
        </div>

        {/* NOT USEFUL PORTAL */}
        <div
          onMouseEnter={() => setHoveredSide('not-useful')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={onSelectNotUseful}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectNotUseful()}
          className="group relative flex-1 min-h-[420px] rounded-2xl p-8 sm:p-10 flex flex-col justify-between cursor-pointer border transition-all duration-500 overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-md border-indigo-500/20 hover:border-purple-400/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.18)] focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        >
          {/* Subtle ghostly wisp aura in background */}
          <div className="pointer-events-none absolute -right-16 -top-16 w-52 h-52 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-700" />

          {/* Top category label */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-['JetBrains_Mono'] tracking-wider uppercase">
                <Ghost className="w-3.5 h-3.5" />
                👻 NOT USEFUL
              </span>
              <span className="text-[10px] font-['JetBrains_Mono'] text-purple-400/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                DIGITAL SÉANCE
              </span>
            </div>

            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl text-zinc-100 group-hover:text-purple-100 tracking-wider font-light mb-3 transition-colors">
              Everyone who came before you is still here.
            </h2>

            <p className="font-['Inter'] text-sm text-zinc-400 group-hover:text-zinc-300 leading-relaxed mb-6 transition-colors">
              Previous visitors wander around the page continuously replaying their movements. Serve no purpose whatsoever, yet mysteriously hypnotic.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-purple-300/80">
              <Compass className="w-3.5 h-3.5" />
              <span>Their cursors never left.</span>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="pt-8 border-t border-zinc-800/80 group-hover:border-purple-500/30 transition-colors flex items-center justify-between">
            <span className="text-sm font-['Inter'] font-medium text-purple-300 group-hover:translate-x-1 transition-transform flex items-center gap-2">
              Meet the ghosts
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-500 group-hover:text-purple-400/70 transition-colors">
              Firebase Realtime
            </span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-xs font-['Inter'] text-zinc-400 tracking-wider">
        <p>Made with <span className="text-rose-500">♥</span> by Yash Gangwani for GDG</p>
      </footer>
    </div>
  );
};
