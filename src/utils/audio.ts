// Web Audio API ambient ethereal soundscape (zero external assets needed)

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let droneOsc1: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let droneFilter: BiquadFilterNode | null = null;
let isMuted = true;

function initAudio() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Ethereal sub-bass ambient drone (108 Hz + 162 Hz harmonic)
    droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(280, audioCtx.currentTime);
    droneFilter.Q.setValueAtTime(3.0, audioCtx.currentTime);
    droneFilter.connect(masterGain);

    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = 'sine';
    droneOsc1.frequency.setValueAtTime(108, audioCtx.currentTime);

    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(162.3, audioCtx.currentTime); // subtle beat frequency

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);

    droneOsc1.start();
    droneOsc2.start();
  } catch (e) {
    console.warn('[Audio] Web Audio initialization notice:', e);
  }
}

export function toggleMute(muted?: boolean): boolean {
  initAudio();
  if (!audioCtx || !masterGain) return true;

  if (muted !== undefined) {
    isMuted = muted;
  } else {
    isMuted = !isMuted;
  }

  if (audioCtx.state === 'suspended' && !isMuted) {
    audioCtx.resume();
  }

  const targetVol = isMuted ? 0 : 0.08;
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.4);

  return isMuted;
}

export function getAudioMuted(): boolean {
  return isMuted;
}

/**
 * Play a delicate celestial chime when a ghost clicks or ripples
 */
export function playGhostChime(freq: number = 528) {
  if (isMuted || !audioCtx || !masterGain) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, audioCtx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  } catch (e) {
    // ignore
  }
}

/**
 * Play a low resonant whisper when a ghost becomes aware of player
 */
export function playGhostWhisper() {
  if (isMuted || !audioCtx || !masterGain) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(216, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(324, audioCtx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    // ignore
  }
}
