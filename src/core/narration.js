/**
 * Narration Engine for ZenLab Platform
 *
 * Provides warm, natural Israeli Hebrew voiceover across:
 * 1. Pre-rendered Google Gemini 3.8 Flash TTS studio MP3 masters (`/audio/...`)
 * 2. Live server-side `/api/tts` Google Gemini 3.8 TTS synthesis for dynamic text
 *    (custom Station 8 stories, open Tutor responses, glossary items)
 * 3. Graceful offline fallback to the browser's native Web Speech API
 */

import { StorageEngine } from './storage.js';
import { cleanHebrewForSpeech } from './speechUtils.js';

const MAX_DYNAMIC_CACHE_ENTRIES = 30;

class NarrationEngineClass {
  constructor() {
    this.html5Audio = null;
    this.currentAudioSrc = '';
    this.currentUtterance = null;
    this.activeAbortController = null;
    this.playSessionId = 0;
    this.dynamicAudioCache = new Map();
    this.isPlaying = false;
    this.isPaused = false;
    this.progress = 0;
    this.rate = 1.0; // Natural studio pace for Google Gemini 3.8 Puck audio
    this.pitch = 1.0;
    this.currentText = '';
    this.spokenText = '';
    this.currentVoiceName = '';
    this.listeners = new Set();
    this.progressTimer = null;
    this.estimatedDuration = 60;

    this.hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

    if (typeof window !== 'undefined') {
      StorageEngine.subscribe((state) => {
        if (!state.isNarrationEnabled && this.isPlaying) {
          this.stop();
        }
      });
      if (this.hasSpeech) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.notify();
        };
      }
    }
  }

  speak(text, audioSrc = '') {
    this.play(text, audioSrc);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
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

  getEffectivePlaybackRate() {
    return this.rate;
  }

  setRate(newRate) {
    this.rate = Math.max(0.8, Math.min(1.75, newRate));
    if (this.html5Audio) {
      if ('preservesPitch' in this.html5Audio) {
        this.html5Audio.preservesPitch = true;
      } else if ('webkitPreservesPitch' in this.html5Audio) {
        this.html5Audio.webkitPreservesPitch = true;
      }
      this.html5Audio.playbackRate = this.getEffectivePlaybackRate();
    }
    this.notify();
  }

  setPitch(newPitch) {
    this.pitch = Math.max(0.8, Math.min(1.4, newPitch));
    this.notify();
  }

  getAvailableHebrewVoices() {
    if (!this.hasSpeech) return [];
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const hebrewVoices = voices.filter(
        (v) =>
          (v.lang && (v.lang.startsWith('he') || v.lang.startsWith('iw'))) ||
          v.name.includes('Hebrew') ||
          v.name.includes('עברית')
      );

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

  getBestHebrewVoice() {
    const list = this.getAvailableHebrewVoices();
    return list.length > 0 ? list[0] : null;
  }

  playHtml5AudioUrl(url, sessionId, onFallback) {
    try {
      this.html5Audio = new Audio(url);
      if ('preservesPitch' in this.html5Audio) {
        this.html5Audio.preservesPitch = true;
      } else if ('webkitPreservesPitch' in this.html5Audio) {
        this.html5Audio.webkitPreservesPitch = true;
      }
      this.html5Audio.playbackRate = this.getEffectivePlaybackRate();
      this.currentVoiceName = 'זֶן — קריינות טבעית (Google Gemini)';

      this.html5Audio.addEventListener('play', () => {
        if (this.html5Audio) {
          this.html5Audio.playbackRate = this.getEffectivePlaybackRate();
        }
      });

      this.html5Audio.addEventListener('timeupdate', () => {
        if (this.html5Audio && this.html5Audio.duration) {
          this.progress = (this.html5Audio.currentTime / this.html5Audio.duration) * 100;
          this.notify();
        }
      });

      this.html5Audio.addEventListener('ended', () => {
        if (sessionId === this.playSessionId) {
          this.handleEnded();
        }
      });

      this.html5Audio.addEventListener('error', () => {
        if (sessionId === this.playSessionId) {
          this.html5Audio = null;
          onFallback?.();
        }
      });

      this.html5Audio
        .play()
        .then(() => {
          if (sessionId !== this.playSessionId) return;
          this.isPlaying = true;
          this.isPaused = false;
          this.notify();
        })
        .catch(() => {
          if (sessionId === this.playSessionId) {
            this.html5Audio = null;
            onFallback?.();
          }
        });
    } catch {
      this.html5Audio = null;
      onFallback?.();
    }
  }

  /**
   * Play narration for text and/or optional studio audio source.
   * Falls back to live `/api/tts` when `audioSrc` is omitted, then Web Speech API offline.
   */
  play(text, audioSrc = '', durationSec = 60) {
    if (!StorageEngine.getState().isNarrationEnabled) {
      StorageEngine.setNarrationEnabled(true);
    }

    this.stop();
    const sessionId = ++this.playSessionId;
    this.currentText = text;
    this.currentAudioSrc = audioSrc || '';
    this.spokenText = cleanHebrewForSpeech(text);
    this.estimatedDuration = durationSec || 60;
    this.progress = 0;

    // 1. Pre-rendered Studio MP3 Master (instant 0ms playback, 100% offline capable)
    if (audioSrc && typeof window !== 'undefined') {
      this.playHtml5AudioUrl(audioSrc, sessionId, () => {
        this.playDynamicOrFallback(sessionId);
      });
      return;
    }

    // 2. Dynamic text without pre-rendered MP3 -> live `/api/tts` (cached) -> Web Speech fallback
    this.playDynamicOrFallback(sessionId);
  }

  async playDynamicOrFallback(sessionId) {
    if (typeof window === 'undefined' || !this.spokenText) {
      if (sessionId === this.playSessionId) {
        this.playSpeechSynthesis(this.spokenText);
      }
      return;
    }

    const cacheKey = this.spokenText;
    const cachedUrl = this.dynamicAudioCache.get(cacheKey);
    if (cachedUrl) {
      this.playHtml5AudioUrl(cachedUrl, sessionId, () => {
        this.playSpeechSynthesis(this.spokenText);
      });
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentVoiceName = 'זֶן — מפיק קול טבעי...';
    this.notify();

    try {
      this.activeAbortController = new AbortController();
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: this.spokenText }),
        signal: this.activeAbortController.signal
      });

      if (sessionId !== this.playSessionId) return;

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.startsWith('audio/')) {
        const blob = await res.blob();
        if (sessionId !== this.playSessionId) return;

        if (this.dynamicAudioCache.size >= MAX_DYNAMIC_CACHE_ENTRIES) {
          const oldestKey = this.dynamicAudioCache.keys().next().value;
          const oldestUrl = this.dynamicAudioCache.get(oldestKey);
          this.dynamicAudioCache.delete(oldestKey);
          if (oldestUrl) URL.revokeObjectURL(oldestUrl);
        }

        const objectUrl = URL.createObjectURL(blob);
        this.dynamicAudioCache.set(cacheKey, objectUrl);
        this.playHtml5AudioUrl(objectUrl, sessionId, () => {
          this.playSpeechSynthesis(this.spokenText);
        });
        return;
      }
    } catch (err) {
      if (err?.name === 'AbortError' || sessionId !== this.playSessionId) {
        return;
      }
    } finally {
      this.activeAbortController = null;
    }

    if (sessionId === this.playSessionId) {
      this.playSpeechSynthesis(this.spokenText);
    }
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

      const bestVoice = this.getBestHebrewVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
        this.currentVoiceName = bestVoice.name;
      } else {
        this.currentVoiceName = 'ברירת מחדל';
      }

      const totalChars = phoneticText.length;

      utterance.onboundary = (event) => {
        if (event.charIndex !== undefined && totalChars > 0) {
          this.progress = Math.min(100, (event.charIndex / totalChars) * 100);
          this.notify();
        }
      };

      utterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
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
    const approxDurationSec = Math.max(8, totalChars / 12 / this.rate);

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
    this.playSessionId += 1;
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {
        // ignore abort error
      }
      this.activeAbortController = null;
    }
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
