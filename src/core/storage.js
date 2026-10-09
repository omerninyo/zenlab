/**
 * Storage and Progress Engine for LearnAI Platform
 * 
 * Manages reactive state persistence for completed challenges,
 * lab stars, active lab selection, and audio preferences.
 */

import { AudioEngine } from './audio.js';

const STORAGE_KEY = 'learnai_progress_state_v1';

const defaultState = {
  completedChallenges: {},
  labStars: {
    lab1: 0,
    lab2: 0,
    lab3: 0,
    lab4: 0,
    lab5: 0,
    lab6: 0,
    lab7: 0,
    lab8: 0
  },
  totalStars: 0,
  isMuted: false,
  isNarrationEnabled: true,
  labPhases: {
    lab1: 'theory',
    lab2: 'theory',
    lab3: 'theory',
    lab4: 'theory',
    lab5: 'theory',
    lab6: 'theory',
    lab7: 'theory',
    lab8: 'theory'
  },
  activeLabId: 'lab1',
  viewMode: 'home', // 'home' (roadmap overview) | 'lab' (active lab workspace)
  theme: 'light', // 'light' (default bright classroom mode) | 'dark'
  dapimMode: false, // Dapim 4.0 Liquid Glass & Hollow Restraint theme preview
  dapimPalette: 'champagne-gold' // 'champagne-gold' (default) | 'matte-amber' | 'nordic-ice' | 'emerald-sanctuary'
};

class StorageEngineClass {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
    AudioEngine.setMuted(this.state.isMuted);

    // Apply theme and Dapim attributes to document
    if (typeof document !== 'undefined') {
      const activeTheme = this.state.theme || 'light';
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }

      if (this.state.dapimMode) {
        document.body.classList.add('dapim-mode');
      }
      if (this.state.dapimPalette) {
        document.documentElement.setAttribute('data-theme', this.state.dapimPalette);
      }
    }
  }

  loadState() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...defaultState };
    }
    try {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (!serialized) return { ...defaultState };
      const parsed = JSON.parse(serialized);
      return {
        ...defaultState,
        ...parsed,
        labStars: { ...defaultState.labStars, ...(parsed.labStars || {}) },
        completedChallenges: { ...(parsed.completedChallenges || {}) },
        viewMode: parsed.viewMode || 'home'
      };
    } catch {
      return { ...defaultState };
    }
  }

  saveState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
    this.notify();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const current = this.getState();
    this.listeners.forEach(fn => fn(current));
  }

  isChallengeCompleted(challengeId) {
    return !!this.state.completedChallenges[challengeId];
  }

  completeChallenge(labId, challengeId, rewardStars = 1) {
    if (this.state.completedChallenges[challengeId]) {
      return { isNew: false, state: this.getState() };
    }

    this.state.completedChallenges[challengeId] = true;
    const currentStars = this.state.labStars[labId] || 0;
    this.state.labStars[labId] = currentStars + rewardStars;

    this.state.totalStars = Object.values(this.state.labStars).reduce((sum, v) => sum + v, 0);
    this.saveState();

    return { isNew: true, state: this.getState() };
  }

  recordChallengeCompletion(labId, challengeId, rewardStars = 1) {
    return this.completeChallenge(labId, challengeId, rewardStars);
  }

  setMuted(isMuted) {
    this.state.isMuted = !!isMuted;
    AudioEngine.setMuted(this.state.isMuted);
    this.saveState();
  }

  setNarrationEnabled(enabled) {
    this.state.isNarrationEnabled = !!enabled;
    this.saveState();
  }

  toggleNarration() {
    this.state.isNarrationEnabled = !this.state.isNarrationEnabled;
    this.saveState();
    return this.state.isNarrationEnabled;
  }

  setLabPhase(labId, phase) {
    if (!this.state.labPhases) this.state.labPhases = {};
    this.state.labPhases[labId] = phase === 'interactive' ? 'interactive' : 'theory';
    this.saveState();
  }

  getLabPhase(labId) {
    return this.state.labPhases?.[labId] || 'theory';
  }

  setActiveLab(labId) {
    this.state.activeLabId = labId;
    this.saveState();
  }

  getViewMode() {
    return this.state.viewMode || 'home';
  }

  setViewMode(mode) {
    this.state.viewMode = mode === 'lab' ? 'lab' : 'home';
    this.saveState();
  }

  getTheme() {
    return this.state.theme || 'light';
  }

  setTheme(theme) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    this.state.theme = validTheme;
    this.saveState();
    if (typeof document !== 'undefined') {
      if (validTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
    this.notify();
  }

  toggleTheme() {
    const next = (this.state.theme || 'light') === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  getDapimMode() {
    return !!this.state.dapimMode;
  }

  setDapimMode(active) {
    this.state.dapimMode = !!active;
    if (typeof document !== 'undefined') {
      if (this.state.dapimMode) {
        document.body.classList.add('dapim-mode');
      } else {
        document.body.classList.remove('dapim-mode');
      }
      const activeTheme = this.state.theme || 'light';
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
    this.saveState();
  }

  toggleDapimMode() {
    const next = !this.state.dapimMode;
    this.setDapimMode(next);
    return next;
  }

  getDapimPalette() {
    return this.state.dapimPalette || 'champagne-gold';
  }

  setDapimPalette(palette) {
    const validPalettes = ['champagne-gold', 'matte-amber', 'nordic-ice', 'emerald-sanctuary'];
    const selected = validPalettes.includes(palette) ? palette : 'champagne-gold';
    this.state.dapimPalette = selected;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', selected);
    }
    this.saveState();
  }

  resetProgress() {
    this.state = {
      ...defaultState,
      completedChallenges: {},
      labStars: {
        lab1: 0,
        lab2: 0,
        lab3: 0,
        lab4: 0,
        lab5: 0,
        lab6: 0,
        lab7: 0,
        lab8: 0
      },
      labPhases: {
        lab1: 'theory',
        lab2: 'theory',
        lab3: 'theory',
        lab4: 'theory',
        lab5: 'theory',
        lab6: 'theory',
        lab7: 'theory',
        lab8: 'theory'
      },
      totalStars: 0,
      activeLabId: 'lab1',
      viewMode: 'home',
      isMuted: this.state.isMuted,
      isNarrationEnabled: this.state.isNarrationEnabled
    };
    this.saveState();
  }

  exportStateJSON() {
    return JSON.stringify({
      schema: 'zenlab-progress-v1',
      exportedAt: new Date().toISOString(),
      state: this.getState()
    }, null, 2);
  }

  importStateJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const incomingState = parsed.state || parsed;
      if (!incomingState || typeof incomingState !== 'object') {
        return { success: false, error: 'קובץ לא תקין' };
      }

      this.state = {
        ...defaultState,
        ...incomingState,
        labStars: {
          ...defaultState.labStars,
          ...(incomingState.labStars || {})
        },
        completedChallenges: {
          ...(incomingState.completedChallenges || {})
        },
        labPhases: {
          ...defaultState.labPhases,
          ...(incomingState.labPhases || {})
        }
      };

      this.state.totalStars = Object.values(this.state.labStars).reduce((sum, v) => sum + (Number(v) || 0), 0);
      this.saveState();
      return { success: true, totalStars: this.state.totalStars };
    } catch (err) {
      return { success: false, error: err.message || 'שגיאה בפענוח הקובץ' };
    }
  }
}

export const StorageEngine = new StorageEngineClass();
