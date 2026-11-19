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
  theme: 'light', // Always daylight white
  dapimMode: false, // Legacy token backdrop disabled for Daylight UI
  dapimPalette: 'champagne-gold',
  customAnimals: [], // User-created sandbox animals for Lab 3
  labStepProgress: {}, // Maps labId -> last active step index for auto-resume
  bestStreak: 0, // Highest consecutive first-try pass streak
  openedChests: {} // Maps world1..world4 -> true once trophy chest is opened
};

class StorageEngineClass {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
    AudioEngine.setMuted(this.state.isMuted);

    // Enforce daylight surface defaults on document root
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      if (document.body) {
        document.body.classList.remove('dapim-mode');
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
        viewMode: parsed.viewMode || 'home',
        theme: 'light',
        dapimMode: false,
        dapimPalette: parsed.dapimPalette || 'champagne-gold',
        labStepProgress: { ...(parsed.labStepProgress || {}) },
        bestStreak: Number(parsed.bestStreak) || 0,
        openedChests: { ...(parsed.openedChests || {}) }
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

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('zen-challenge-completed', {
          detail: { labId, challengeId, rewardStars }
        }));
      } catch {}
    }

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

  getLabStep(labId) {
    const val = this.state.labStepProgress?.[labId];
    return Number.isInteger(val) && val >= 0 ? val : 0;
  }

  setLabStep(labId, stepIndex) {
    if (!this.state.labStepProgress) this.state.labStepProgress = {};
    const safeStep = Number.isInteger(stepIndex) && stepIndex >= 0 ? stepIndex : 0;
    if (this.state.labStepProgress[labId] === safeStep) return;
    this.state.labStepProgress[labId] = safeStep;
    this.saveState();
  }

  clearLabStep(labId) {
    if (!this.state.labStepProgress || !(labId in this.state.labStepProgress)) return;
    delete this.state.labStepProgress[labId];
    this.saveState();
  }

  recordStreak(streak) {
    const val = Number(streak) || 0;
    if (val > (this.state.bestStreak || 0)) {
      this.state.bestStreak = val;
      this.saveState();
    }
  }

  isChestOpened(worldId) {
    return Boolean(this.state.openedChests?.[worldId]);
  }

  openChest(worldId) {
    if (!this.state.openedChests) this.state.openedChests = {};
    if (this.state.openedChests[worldId]) return;
    this.state.openedChests[worldId] = true;
    this.saveState();
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
    return 'light';
  }

  setTheme() {
    this.state.theme = 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    this.saveState();
  }

  toggleTheme() {
    this.setTheme('light');
    return 'light';
  }

  getDapimMode() {
    return false;
  }

  setDapimMode() {
    this.state.dapimMode = false;
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('dapim-mode');
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    this.saveState();
  }

  toggleDapimMode() {
    this.setDapimMode(false);
    return false;
  }

  getDapimPalette() {
    return this.state.dapimPalette || 'champagne-gold';
  }

  setDapimPalette(palette) {
    this.state.dapimPalette = palette || 'champagne-gold';
    this.saveState();
  }

  getCustomAnimals() {
    return Array.isArray(this.state.customAnimals) ? this.state.customAnimals : [];
  }

  saveCustomAnimals(animals) {
    this.state.customAnimals = Array.isArray(animals) ? animals : [];
    this.saveState();
    this.notify();
  }

  addCustomAnimal(animal) {
    const list = this.getCustomAnimals();
    const nextList = [...list.filter(a => a.id !== animal.id), animal];
    this.saveCustomAnimals(nextList);
    return nextList;
  }

  removeCustomAnimal(animalId) {
    const list = this.getCustomAnimals();
    const nextList = list.filter(a => a.id !== animalId);
    this.saveCustomAnimals(nextList);
    return nextList;
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
      isNarrationEnabled: this.state.isNarrationEnabled,
      labStepProgress: {},
      bestStreak: 0,
      openedChests: {}
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

  /**
   * Generates a compact 6-character Hex classroom save code (e.g. "3F8A21")
   * representing the 24 challenge bits across Labs 1..8 (Zero-PII).
   */
  getSaveCode() {
    let bitmask = 0;
    for (let lab = 1; lab <= 8; lab++) {
      for (let ch = 1; ch <= 3; ch++) {
        const bitIndex = (lab - 1) * 3 + (ch - 1);
        const key = `lab${lab}_challenge${ch}`;
        if (this.state.completedChallenges?.[key]) {
          bitmask |= (1 << bitIndex);
        }
      }
    }
    // XOR with a fixed classroom salt (0x5A454E = "ZEN") so 0 stars isn't just "000000"
    const salted = (bitmask ^ 0x5A454E) >>> 0;
    return salted.toString(16).toUpperCase().padStart(6, '0');
  }

  /**
   * Restores completedChallenges and labStars from a 6-character Hex classroom save code.
   */
  restoreFromSaveCode(rawCode) {
    if (!rawCode || typeof rawCode !== 'string') {
      return { success: false, error: 'נא להזין קוד שמירה בן 6 תווים' };
    }
    const clean = rawCode.trim().replace(/^ZN-/i, '').replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    if (clean.length !== 6) {
      return { success: false, error: 'קוד השמירה חייב להכיל 6 תווים (ספרות 0-9 או אותיות A-F)' };
    }
    const salted = parseInt(clean, 16);
    if (Number.isNaN(salted)) {
      return { success: false, error: 'קוד שמירה לא תקין' };
    }
    const bitmask = (salted ^ 0x5A454E) & 0xFFFFFF;
    const completedChallenges = {};
    const labStars = {};
    let totalStars = 0;

    for (let lab = 1; lab <= 8; lab++) {
      let starsForLab = 0;
      for (let ch = 1; ch <= 3; ch++) {
        const bitIndex = (lab - 1) * 3 + (ch - 1);
        const isDone = Boolean((bitmask >> bitIndex) & 1);
        if (isDone) {
          completedChallenges[`lab${lab}_challenge${ch}`] = true;
          starsForLab += 1;
        }
      }
      labStars[`lab${lab}`] = starsForLab;
      totalStars += starsForLab;
    }

    this.state.completedChallenges = completedChallenges;
    this.state.labStars = labStars;
    this.state.totalStars = totalStars;
    this.saveState();
    return { success: true, totalStars };
  }
}

export const StorageEngine = new StorageEngineClass();

