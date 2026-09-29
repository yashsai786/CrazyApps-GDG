import React, { useEffect, useRef } from 'react';

export const Atmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Barely perceptible, slow ambient dust motes (restrained, subconscious presence)
    const particles = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -0.04 - Math.random() * 0.06,
      radius: 0.6 + Math.random() * 0.8,
      alpha: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Very faint drifting specks
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += dt * 0.4;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 230, ${currentAlpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Base dark atmosphere: Center is slightly lighter/clearer than the deep edges */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, #080a10 0%, #040508 65%, #020204 100%)'
        }}
      />

      {/* 2. Soft perimeter vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2, 2, 4, 0.7) 85%, #020204 100%)'
        }}
      />

      {/* 3. Extremely subtle cool atmospheric glow in upper center */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(99, 102, 241, 0.035) 0%, transparent 60%)'
        }}
      />

      {/* 4. Barely perceptible ambient dust drift */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block w-full h-full opacity-40" 
      />

      {/* 5. Ultra-subtle, non-intrusive organic film grain (5-6% opacity, NOT TV static) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.05,
          mixBlendMode: 'screen',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};
