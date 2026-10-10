/**
 * Audio Engine for LearnAI Platform
 * 
 * Implements procedural sound synthesis using browser Web Audio API.
 * Contains zero external audio asset dependencies.
 */

class AudioEngineClass {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.listeners = new Set();
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(isMuted) {
    this.muted = !!isMuted;
    this.listeners.forEach(fn => fn(this.muted));
  }

  isMuted() {
    return this.muted;
  }

  onMuteChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  playToggle(isOn) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const freq = isOn ? 580 : 320;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isOn ? 880 : 220, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playStep() {
    this.playTone(380, 'sine', 0.04, 0.05);
  }

  playClick() {
    this.playStep();
  }

  playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.09);
      }, idx * 60);
    });
  }

  playUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [440, 554.37, 659.25, 880];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, 0.08);
      }, idx * 70);
    });
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const fanfares = [440, 554.37, 659.25, 880, 1108.73];
    fanfares.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.2, 0.1);
      }, idx * 80);
    });
  }

  playZenChime() {
    if (this.muted) return;
    const now = Date.now();
    if (this._lastChimeTime && (now - this._lastChimeTime < 350)) return;
    this._lastChimeTime = now;
    this.init();
    if (!this.ctx) return;

    // Peaceful, resonant pentatonic chime (C5, E5, G5, C6)
    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      const startTime = this.ctx.currentTime + idx * 0.08;
      const duration = 0.85;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.07, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch {}
    });
  }

  playChallengeSuccess() {
    this.playZenChime();
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  playToken() {
    this.playTone(600 + Math.random() * 200, 'sine', 0.05, 0.04);
  }
}

export const AudioEngine = new AudioEngineClass();
