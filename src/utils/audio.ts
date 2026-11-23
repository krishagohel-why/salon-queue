// Web Audio API Synthesizer for high-fidelity salon announcement chimes
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playChimeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Two-tone bell chime: Note 1 (E5: 659.25 Hz) followed by Note 2 (B5: 987.77 Hz)
    const tones = [
      { freq: 659.25, time: now, duration: 0.6 },
      { freq: 880.00, time: now + 0.15, duration: 0.8 },
      { freq: 1046.50, time: now + 0.35, duration: 1.2 }
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Smooth attack and pleasant exponential release bell sound
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.25, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  } catch (err) {
    console.warn("Audio chime could not play due to browser user-gesture restrictions:", err);
  }
}

export function triggerVibration() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Gentle pulse vibration pattern: 250ms vibrate, 150ms pause, 350ms vibrate
      navigator.vibrate([250, 150, 350]);
    } catch {
      // Ignore vibration error if not permitted
    }
  }
}
