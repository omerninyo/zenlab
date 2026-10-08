/**
 * Narration Engine for ZenLab Platform
 * 
 * Provides unified audio voiceover / narration capabilities.
 * Supports HTML5 Audio for pre-recorded media files, with seamless
 * browser Web Speech API (speechSynthesis) fallback in Hebrew (he-IL).
 */

import { StorageEngine } from './storage.js';

class NarrationEngineClass {
  constructor() {
    this.html5Audio = null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.progress = 0; // 0 to 100
    this.rate = 1.0; // 1.0, 1.25, 1.5
    this.currentText = '';
    this.listeners = new Set();
    this.progressTimer = null;
    this.estimatedDuration = 60; // seconds

    // Check speech synthesis availability
    this.hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
    
    // Listen for storage changes regarding narration mute
    if (typeof window !== 'undefined') {
      StorageEngine.subscribe(state => {
        if (!state.isNarrationEnabled && this.isPlaying) {
          this.stop();
        }
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      progress: Math.min(100, Math.max(0, Math.round(this.progress))),
      rate: this.rate,
      currentText: this.currentText,
      hasSpeech: this.hasSpeech
    };
  }

  setRate(newRate) {
    this.rate = newRate;
    if (this.html5Audio) {
      this.html5Audio.playbackRate = this.rate;
    }
    // If speaking via Web Speech, restart from current position if possible or apply to next segment
    this.notify();
  }

  /**
   * Play narration for text and/or optional audio source
   * @param {string} text - Hebrew narration text
   * @param {string} [audioSrc] - Optional URL to audio file
   * @param {number} [durationSec] - Estimated duration in seconds
   */
  play(text, audioSrc = '', durationSec = 60) {
    if (!StorageEngine.getState().isNarrationEnabled) {
      StorageEngine.setNarrationEnabled(true);
    }

    this.stop();
    this.currentText = text;
    this.estimatedDuration = durationSec || 60;
    this.progress = 0;

    // 1. If audioSrc is provided and valid, try HTML5 Audio
    if (audioSrc && typeof window !== 'undefined') {
      try {
        this.html5Audio = new Audio(audioSrc);
        this.html5Audio.playbackRate = this.rate;

        this.html5Audio.addEventListener('timeupdate', () => {
          if (this.html5Audio && this.html5Audio.duration) {
            this.progress = (this.html5Audio.currentTime / this.html5Audio.duration) * 100;
            this.notify();
          }
        });

        this.html5Audio.addEventListener('ended', () => {
          this.handleEnded();
        });

        this.html5Audio.addEventListener('error', () => {
          // Fall back to Web Speech
          this.html5Audio = null;
          this.playSpeechSynthesis(text);
        });

        this.html5Audio.play().then(() => {
          this.isPlaying = true;
          this.isPaused = false;
          this.notify();
        }).catch(() => {
          this.html5Audio = null;
          this.playSpeechSynthesis(text);
        });
        return;
      } catch {
        this.html5Audio = null;
      }
    }

    // 2. Otherwise, use Web Speech API
    this.playSpeechSynthesis(text);
  }

  playSpeechSynthesis(text) {
    if (!this.hasSpeech) {
      this.simulatePlayback(text);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = this.rate;

      // Locate Hebrew voice if available
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(v => v.lang.startsWith('he') || v.lang.startsWith('iw'));
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }

      const totalChars = text.length;
      let startTimestamp = Date.now();

      utterance.onboundary = (event) => {
        if (event.charIndex !== undefined && totalChars > 0) {
          this.progress = (event.charIndex / totalChars) * 100;
          this.notify();
        }
      };

      utterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
        startTimestamp = Date.now();
        this.startTimer(totalChars);
        this.notify();
      };

      utterance.onend = () => {
        this.handleEnded();
      };

      utterance.onerror = () => {
        this.handleEnded();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.simulatePlayback(text);
    }
  }

  simulatePlayback(text) {
    // Progress ticker simulation for environments with restricted speech synthesis
    this.isPlaying = true;
    this.isPaused = false;
    this.progress = 0;
    this.notify();

    const totalSeconds = Math.max(10, Math.round(text.length / 15)); // ~15 chars/sec
    const stepMs = 250;
    const increment = (stepMs / (totalSeconds * 1000)) * 100;

    clearInterval(this.progressTimer);
    this.progressTimer = setInterval(() => {
      if (!this.isPaused && this.isPlaying) {
        this.progress += increment;
        if (this.progress >= 100) {
          this.handleEnded();
        } else {
          this.notify();
        }
      }
    }, stepMs);
  }

  startTimer(totalChars) {
    clearInterval(this.progressTimer);
    const approxDurationSec = Math.max(10, (totalChars / 14) / this.rate);

    this.progressTimer = setInterval(() => {
      if (this.isPlaying && !this.isPaused && this.progress < 95) {
        this.progress += (1 / approxDurationSec) * 100 * 0.2;
        this.notify();
      }
    }, 200);
  }

  pause() {
    if (!this.isPlaying) return;

    if (this.html5Audio) {
      this.html5Audio.pause();
    } else if (this.hasSpeech) {
      window.speechSynthesis.pause();
    }

    this.isPaused = true;
    this.notify();
  }

  resume() {
    if (!this.isPaused) return;

    if (this.html5Audio) {
      this.html5Audio.play().catch(() => {});
    } else if (this.hasSpeech) {
      window.speechSynthesis.resume();
    }

    this.isPaused = false;
    this.notify();
  }

  toggle() {
    if (this.isPlaying && !this.isPaused) {
      this.pause();
    } else if (this.isPlaying && this.isPaused) {
      this.resume();
    }
  }

  stop() {
    if (this.html5Audio) {
      this.html5Audio.pause();
      this.html5Audio.currentTime = 0;
      this.html5Audio = null;
    }
    if (this.hasSpeech) {
      window.speechSynthesis.cancel();
    }
    clearInterval(this.progressTimer);
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.progress = 0;
    this.notify();
  }

  seek(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    this.progress = clamped;

    if (this.html5Audio && this.html5Audio.duration) {
      this.html5Audio.currentTime = (clamped / 100) * this.html5Audio.duration;
    }
    this.notify();
  }

  handleEnded() {
    clearInterval(this.progressTimer);
    this.isPlaying = false;
    this.isPaused = false;
    this.progress = 100;
    this.notify();
    setTimeout(() => {
      if (!this.isPlaying) {
        this.progress = 0;
        this.notify();
      }
    }, 1000);
  }
}

export const NarrationEngine = new NarrationEngineClass();
