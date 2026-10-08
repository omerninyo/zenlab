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
    lab4: 0
  },
  totalStars: 0,
  isMuted: false,
  activeLabId: 'lab1'
};

class StorageEngineClass {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
    AudioEngine.setMuted(this.state.isMuted);
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
        completedChallenges: { ...(parsed.completedChallenges || {}) }
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

  setMuted(isMuted) {
    this.state.isMuted = !!isMuted;
    AudioEngine.setMuted(this.state.isMuted);
    this.saveState();
  }

  setActiveLab(labId) {
    this.state.activeLabId = labId;
    this.saveState();
  }

  resetProgress() {
    this.state = {
      ...defaultState,
      isMuted: this.state.isMuted
    };
    this.saveState();
  }
}

export const StorageEngine = new StorageEngineClass();
