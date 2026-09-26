/**
 * Procedural Realistic & Comic Fart Sound Generator using Web Audio API
 * Generates rich, vibrating, juicy fart sound effects dynamically without external audio assets.
 */

class FartAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a procedural fart sound with custom style
   */
  public playFart(style: 'rip' | 'wet' | 'trumpet' | 'deep' | 'random' = 'random') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const selectedStyle = style === 'random' 
        ? (['rip', 'wet', 'trumpet', 'deep'][Math.floor(Math.random() * 4)] as 'rip' | 'wet' | 'trumpet' | 'deep')
        : style;

      const now = ctx.currentTime;
      const duration = selectedStyle === 'rip' ? 0.65 : selectedStyle === 'wet' ? 0.75 : selectedStyle === 'trumpet' ? 0.85 : 1.1;

      // Master gain for the fart
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      masterGain.connect(ctx.destination);

      // 1. Low frequency flutter oscillator (the flapping/vibration)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = selectedStyle === 'trumpet' ? 'sawtooth' : 'triangle';

      const baseFreq = selectedStyle === 'deep' ? 65 : selectedStyle === 'trumpet' ? 140 : 85;
      osc.frequency.setValueAtTime(baseFreq, now);
      // Pitch drop envelope
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + duration);

      // Flutter LFO to modulate pitch heavily
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(selectedStyle === 'wet' ? 32 : 24, now);
      lfo.frequency.linearRampToValueAtTime(14, now + duration);
      lfoGain.gain.setValueAtTime(selectedStyle === 'wet' ? 45 : 30, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      osc.connect(oscGain);
      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.linearRampToValueAtTime(0.9, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);

      // 2. Air / Noise burst (the gust/fizz)
      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Filter the noise to sound squishy/gassy
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(selectedStyle === 'wet' ? 650 : 420, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + duration);
      filter.Q.setValueAtTime(selectedStyle === 'wet' ? 6 : 3, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(selectedStyle === 'wet' ? 0.6 : 0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);

    } catch (e) {
      console.warn('Audio playback not supported:', e);
    }
  }
}

export const fartSound = new FartAudioEngine();
export const playFartSound = (style: 'rip' | 'wet' | 'trumpet' | 'deep' | 'random' = 'random') => {
  fartSound.playFart(style);
};
