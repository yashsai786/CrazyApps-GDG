import React from 'react';

interface PrivacyBadgeProps {
  visitorNumber: number;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ visitorNumber }) => {
  return (
    <footer className="pointer-events-none fixed bottom-6 left-6 z-20 flex flex-col gap-0.5 text-[11px] font-['Inter'] text-zinc-600/75 select-none opacity-60">
      <div className="flex items-center gap-2">
        <span className="font-['JetBrains_Mono'] text-zinc-500">You are Visitor #{visitorNumber}</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>Anonymous cursor movement only.</span>
      </div>
      <p className="text-[10px] text-zinc-700">Nothing personally identifiable is stored.</p>
    </footer>
  );
};
