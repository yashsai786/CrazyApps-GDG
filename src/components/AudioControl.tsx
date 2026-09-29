import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleMute, getAudioMuted } from '../utils/audio';

export const AudioControl: React.FC = () => {
  const [muted, setMuted] = useState(getAudioMuted());

  const handleToggle = () => {
    const isNowMuted = toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <button
      onClick={handleToggle}
      title={muted ? "Unmute atmospheric drone" : "Mute audio"}
      aria-label="Toggle ethereal audio"
      className="fixed bottom-6 right-6 z-30 p-2.5 rounded-full bg-zinc-950/70 border border-zinc-800/80 hover:border-indigo-500/40 text-zinc-400 hover:text-zinc-200 backdrop-blur-md transition-all duration-300 shadow-[0_0_12px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
    >
      {muted ? (
        <VolumeX className="w-4 h-4 opacity-70" />
      ) : (
        <div className="relative">
          <Volume2 className="w-4 h-4 text-indigo-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400/80 animate-ping" />
        </div>
      )}
    </button>
  );
};
