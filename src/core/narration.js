/**
 * Narration Engine for ZenLab Platform
 * 
 * Provides high-quality child-friendly Hebrew voiceover & narration.
 * Automatically identifies and prioritizes natural/neural speech synthesis
 * voices (e.g. Google עברית, Microsoft Natural, Siri/Enhanced), phonetically
 * normalizes technical jargon into natural spoken Hebrew, and calibrates
 * pace and warmth for elementary school learners.
 */

import { StorageEngine } from './storage.js';

/**
 * Phonetically normalize Hebrew text for child-friendly speech synthesis:
 * Replaces English acronyms, slashes, and symbols that cause robotic stuttering.
 */
function cleanHebrewForSpeech(text) {
  if (!text) return '';
  return text
    // Remove markdown asterisks, bold marks, backticks, bullets, braces
    .replace(/[*_`#~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
    .replace(/[•&bull;]/g, '')
    // Normalize technical terms to natural spoken Hebrew
    .replace(/\bCPU\b/gi, 'סִי-פִּי-יוּ, המעבד המרכזי')
    .replace(/\bRAM\b/gi, 'רָאם, הזיכרון הראשי')
    .replace(/\bALU\b/gi, 'אֵיי-אֵל-יוּ, יחידת החישוב')
    .replace(/\bLLM\b/gi, 'אֵל-אֵל-אֵם, מודל שפה')
    .replace(/\bLLMs\b/gi, 'מודלי שפה')
    .replace(/\bA\*\b/gi, 'אֵיי סטאר')
    .replace(/\bXOR\b/gi, 'אֶקְס-אוֹר')
    .replace(/\bAND\b/gi, 'שער וְגַם')
    .replace(/\bOR\b/gi, 'שער אוֹ')
    .replace(/\bNOT\b/gi, 'שער שְׁלִילָה')
    .replace(/\bNAND\b/gi, 'נָאנְד')
    .replace(/\bPC\b/gi, 'מונה פקודות')
    .replace(/\bIR\b/gi, 'אוגר פקודה')
    .replace(/\bACC\b/gi, 'אוגר הצובר')
    .replace(/\bChatGPT\b/gi, 'צָ׳אט גִ׳י פִּי טִי')
    .replace(/0\s*ו-1/g, 'אפס ואחת')
    .replace(/10₂/g, 'עשר בבינארית, שזה שתיים')
    .replace(/\+/g, ' ועוד ')
    .replace(/=/g, ' שווה ')
    .replace(/\//g, ' או ')
    .replace(/\s+/g, ' ')
    .trim();
}

class NarrationEngineClass {
  constructor() {
    this.html5Audio = null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.progress = 0; // 0 to 100
    this.rate = 0.92; // slightly slower, clear and friendly for kids
    this.pitch = 1.05; // warmer, enthusiastic frequency
    this.currentText = '';
    this.spokenText = '';
    this.currentVoiceName = '';
    this.listeners = new Set();
    this.progressTimer = null;
    this.estimatedDuration = 60; // seconds

    // Check speech synthesis availability
    this.hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
    
    // Subscribe to storage changes
    if (typeof window !== 'undefined') {
      StorageEngine.subscribe(state => {
        if (!state.isNarrationEnabled && this.isPlaying) {
          this.stop();
        }
      });
      // Pre-warm voices list (browsers load voices asynchronously)
      if (this.hasSpeech) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.notify();
        };
      }
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
      pitch: this.pitch,
      currentText: this.currentText,
      spokenText: this.spokenText,
      currentVoiceName: this.currentVoiceName,
      hasSpeech: this.hasSpeech,
      availableVoices: this.getAvailableHebrewVoices()
    };
  }

  setRate(newRate) {
    this.rate = Math.max(0.7, Math.min(1.5, newRate));
    if (this.html5Audio) {
      this.html5Audio.playbackRate = this.rate;
    }
    this.notify();
  }

  setPitch(newPitch) {
    this.pitch = Math.max(0.8, Math.min(1.4, newPitch));
    this.notify();
  }

  /**
   * Get all installed Hebrew voices sorted by acoustic naturalness
   */
  getAvailableHebrewVoices() {
    if (!this.hasSpeech) return [];
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const hebrewVoices = voices.filter(v => 
        (v.lang && (v.lang.startsWith('he') || v.lang.startsWith('iw'))) ||
        v.name.includes('Hebrew') ||
        v.name.includes('עברית')
      );

      // Score voices: Natural/Online/Google/Enhanced first
      return hebrewVoices.sort((a, b) => {
        const score = (v) => {
          let s = 0;
          const name = v.name.toLowerCase();
          if (name.includes('natural') || name.includes('online')) s += 100;
          if (name.includes('google')) s += 80;
          if (name.includes('enhanced') || name.includes('premium')) s += 60;
          if (name.includes('siri')) s += 50;
          if (v.default) s += 10;
          return s;
        };
        return score(b) - score(a);
      });
    } catch {
      return [];
    }
  }

  /**
   * Find the single best natural Hebrew voice
   */
  getBestHebrewVoice() {
    const list = this.getAvailableHebrewVoices();
    return list.length > 0 ? list[0] : null;
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
    this.spokenText = cleanHebrewForSpeech(text);
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
          this.html5Audio = null;
          this.playSpeechSynthesis(this.spokenText);
        });

        this.html5Audio.play().then(() => {
          this.isPlaying = true;
          this.isPaused = false;
          this.notify();
        }).catch(() => {
          this.html5Audio = null;
          this.playSpeechSynthesis(this.spokenText);
        });
        return;
      } catch {
        this.html5Audio = null;
      }
    }

    // 2. Otherwise, use upgraded Web Speech API
    this.playSpeechSynthesis(this.spokenText);
  }

  playSpeechSynthesis(phoneticText) {
    if (!this.hasSpeech) {
      this.simulatePlayback(phoneticText);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(phoneticText);
      utterance.lang = 'he-IL';
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      // Select highest quality natural voice
      const bestVoice = this.getBestHebrewVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
        this.currentVoiceName = bestVoice.name;
      } else {
        this.currentVoiceName = 'ברירת מחדל';
      }

      const totalChars = phoneticText.length;
      let startTimestamp = Date.now();

      utterance.onboundary = (event) => {
        if (event.charIndex !== undefined && totalChars > 0) {
          this.progress = Math.min(100, (event.charIndex / totalChars) * 100);
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
      this.simulatePlayback(phoneticText);
    }
  }

  simulatePlayback(text) {
    this.isPlaying = true;
    this.isPaused = false;
    this.progress = 0;
    this.notify();

    const totalSeconds = Math.max(10, Math.round(text.length / 14));
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
    const approxDurationSec = Math.max(8, (totalChars / 12) / this.rate);

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
